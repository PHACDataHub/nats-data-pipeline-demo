import 'dotenv/config'
import { connect, JSONCodec, consumerOpts, createInbox, nanos, AckPolicy, jwtAuthenticator } from 'nats';

// NATS variables
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS server (https://app.ngs.global/)
const NATS_URL = "demo.nats.io:4222"
const jc = JSONCodec(); // for decoding NATS messages

// Connect to NATS server using jwt authentication 
const nc = await connect({ 
  servers: NATS_URL, 
  // authenticator: jwtAuthenticator(jwt),
});

// Setup jetstream
const jsm = await nc.jetstreamManager();
// const cfg = {
//   name: "safeInputsDataPipeline4",
//   subjects: ["safeInputsDataPipeline4.>"],
//   max_bytes: 30000000,
//   // ack_policy: "none",
//   no_ack: true,
//   // ack_wait: 50000,
// };
// // await jsm.streams.add(cfg)  // If needs to be created - use this
// await jsm.streams.update(cfg.name, cfg) //If already exisits - use this
// console.log(`Updated the ${cfg.name} stream ...`)
const js = nc.jetstream();

// // Create a consumer 
// const inbox = createInbox();
//   await jsm.consumers.add("safeInputsDataPipeline5", {
//   durable_name: "extractedDataConsumer6",
//   // ack_policy: AckPolicy.None,// Okay - this should probably not be none - will flip to Explicit when flowing
//   // ack_wait: nanos(5000000000),
//   // filter_subject('subject to filter')
//   deliver_subject: inbox,
// });
const opts = consumerOpts();
opts.durable("step2consumer");
opts.manualAck();
opts.ackExplicit();
opts.deliverTo(createInbox());

const subj = "safeInputsDataPipeline5.extractedData.>";
const sub = await js.subscribe(subj, opts); // autocreates consumer

// // Bind stream to durable consumer
opts.bind("safeInputsDataPipeline5", "step2consumer");
console.log("Durable consumer bound to stream ...")

function publish(payload, filename) {
  nc.publish(`safeInputsDataPipeline5.uppercased.${filename}`, jc.encode(payload)) // This needs to be js but having timeouts - still debugging
}

console.log('🚀 Connected to NATS server...');

(async () => {
    for await (const message of sub) {
      message.ack();
      var payload  = jc.decode(message.data)

      // TODO - DO ACTUAL PROCESSING STUFF HERE (here we are just uppercasing to show something.)

      const uppercasedContent = JSON.stringify(payload.content).toUpperCase()
      const uppercasedObj = {
        "filename": payload.filename, 
        "metadata": payload.metadata,
        "content": JSON.parse(uppercasedContent)
      }
      console.log(
        `\n\n---------------------------\n\nRecieved message on \"${subj}\"`,
        `\nPublishing the following on \"safeInputsDataPipeline5.uppercased.${payload.filename}\"\n\n`, 

        {
        "filename": payload.filename, 
        "metadata": payload.metadata,
        "content": uppercasedContent
      })
      
      publish(uppercasedObj, payload.filename)
    }
  })();
  
// don't exit until the client closes
await nc.closed();

