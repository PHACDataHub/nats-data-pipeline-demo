//#################################################
//
// index.js (2-transformation-step-uppercase)
//
// This is an over-simplified transformation - it's just here to show that we can have a real-time data pipeline with 
// some transformations. Listens to jetstream that 1-transfomation-step-extract-subset-of-data.index.js publishes on.
// ################################################

// TODO - maybe try https://github.com/hmenyus/node-calls-python for numpy transformations?
import 'dotenv/config'
import {connect,  JSONCodec, headers, consumerOpts, createInbox, AckPolicy, nanos } from 'nats';
import { replaceNonJetstreamCompatibleCharacters, capitalize} from './src/helper-functions.js'

const jc = JSONCodec(); 

// ----- NATS Connection ----- 
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS NGS server (https://app.ngs.global/)
const NATS_URL = "demo.nats.io:4222" // Synadia's NATS demo server
const nc = await connect({ 
  servers: NATS_URL, 
//   authenticator: jwtAuthenticator(jwt), // Needed if using NGS server
});

// ----- Add jetstream client
const js = nc.jetstream();

// ----- Add stream to publish on ----- 
const pubStream = "safeInputsUppercased"

const jsm = await nc.jetstreamManager(); // allows for CRUD operations
await jsm.streams.add({ name: pubStream, subjects: [`${pubStream}.>`] });

function publish(payload, filename) {
  js.publish(`${pubStream}.${filename}`, jc.encode(payload)) 
}

// ----- Create a durable consumer (with memeory of what it has previously consumed)
// // (Note -consumers can consume messages from more than one stream)
const opts = consumerOpts();
opts.durable("safeInputsExtractedSubsetConsumer"); 
opts.manualAck();
opts.ackExplicit();
opts.deliverTo(createInbox());

// ----- Subscribe to message stream (these are currently being published from 1-transfromation-step-extract-subset-of-data.index.js )
const stream = "safeInputsExtractedSubset"
const sub = await js.subscribe(`${stream}.>`, opts);
console.log('🚀 Connected to NATS jetstream server...');

(async () => {
  for await (const message of sub) {
    message.ack();
    const payload  = jc.decode(message.data)
    const filenameForJetstreamSubject = replaceNonJetstreamCompatibleCharacters(payload.filename)

    // read headers if available (from https://github.com/nats-io/nats.deno)
    if (message.headers) {
      for (const [key, value] of message.headers) {
        console.log(`${key}=${value}`);
      }
    // TODO - DO ACTUAL PROCESSING STUFF HERE (here we are just uppercasing to show something.)

    // go through each sheet and capitalize the data part
    for (var i = 0; i < payload.content.length; ++i) {
      payload.content[i].data = capitalize(payload.content[i].data)
      }

    // Display sub/pub subjects, timestamp and data after transformation
    console.log(
      `\n\n---------------------------\n\n`,
      `Recieved message on \"${message.subject}\"\n`,
      `Publishing the following on \"${stream}.${filenameForJetstreamSubject}\"\n\n`, 
      `Timestamp: ${Date.now()}\n\n`, 
      `filename: ${payload.filename}\n`
      )
    console.log (" metadata: ", JSON.stringify(payload.metadata), "\n")
    console.log(" content: ",JSON.stringify(payload.content))
  
    publish(payload, filenameForJetstreamSubject) 
  }
}
})();

nc.closed();
