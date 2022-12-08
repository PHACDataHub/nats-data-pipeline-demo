//#################################################
// index.js
// ################################################


import {StringCodec, connect,  JSONCodec, headers, consumerOpts, createInbox, AckPolicy, nanos } from 'nats';

// ----- Create NATS Connection ----- 
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS NGS server (https://app.ngs.global/)
const NATS_URL = "demo.nats.io:4222" // Synadia's NATS demo server
const nc = await connect({ 
  servers: NATS_URL, 
//   authenticator: jwtAuthenticator(jwt), // Needed if using NGS server
});

const jc = JSONCodec(); 

// ----- STREAM MANAGEMENT ----- 
// ----- Create jetstream - new stream
const jsm = await nc.jetstreamManager();

const js = nc.jetstream();

// add a stream
const stream = "safeInputsDataPipeline7"
const streamSubj = `safeInputsDataPipeline7.>`;
await jsm.streams.add({ name: stream, subjects: [streamSubj] });


// ----- Bind stream to durable consumer (with memeory of what it has previously consumed)
// (Note -consumers can consume messages from more than one stream)
const opts = consumerOpts();
opts.durable("safeInputsDataPipeline-step2Consumer");
opts.manualAck();
opts.ackExplicit();
opts.deliverTo(createInbox());

opts.bind("safeInputsDataPipeline7", "safeInputsDataPipeline-step2Consumer");

function publish(payload, filename) {
    js.publish(`safeInputsDataPipeline7.uppercased.${filename}`, jc.encode(payload)) // This needs to be js but having timeouts - still debugging
  }

// ----- Subscribe to message stream (these are currently being published from extract-metadata-content.index.js )
const subj = "safeInputsDataPipeline7.extractedData.>";
const sub = await js.subscribe(subj, opts);

console.log('🚀 Connected to NATS jetstream server...');

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
      // `\nPublishing the following on \"safeInputsDataPipeline6.uppercased.${payload.filename}\"\n\n`, 
      `\nPublishing the following on \"safeInputsDataPipeline7.uppercased.filename\"\n\n`, 
      `Timestamp: ${Date.now()}\n\n`, 


      {
      "filename": payload.filename, 
      "metadata": payload.metadata,
      "content": uppercasedContent
    })
    
    // publish(uppercasedObj, payload.filename)
    publish(uppercasedObj, "filename") //Okay - figured out what was breaking the js publish - it was the spaces in filename!
    // will need to fix! 
  }
})();


// await nc.drain();
nc.closed();
