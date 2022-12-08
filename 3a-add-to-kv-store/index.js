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

// // add consumer to e
const inbox = createInbox();
await jsm.consumers.add("safeInputsDataPipeline7", {
  durable_name: "step3Consumer",
//   ack_policy: AckPolicy.None,
  ack_policy: AckPolicy.Explicit,
  deliver_subject: inbox,
});

const opts = consumerOpts();
opts.bind("safeInputsDataPipeline7", "step3Consumer");
console.log("Durable consumer bound to stream ...")


// ----- Create KV Store BUCKET or bind to jetstream if it exists:
const kv = await js.views.kv("extractedSheetData-kv-store", { history: 10 }); //- note bucket can store from multiple streams 

// ----- Subscribe to message stream (these are currently being published from 1-processing-step-extract-subsection-data.index.js )

const subj = "safeInputsDataPipeline7.uppercased.>";
const sub = await js.subscribe(subj, opts);

console.log('🚀 Connected to NATS jetstream server...');

(async () => {
  for await (const message of sub) {
    message.ack(); // acknowledge receipt
    var payload  = jc.decode(message.data)
    // replace whitespace in filename (throws error if used in KV key) 
      // - there is a more graceful way of doing this will come back and fix
    payload.origFilename = payload.filename
    payload.filename = payload.filename.replace(/ /g,"_")
    payload.filename = payload.filename.replace(")","_")
    payload.filename = payload.filename.replace("(","_")
    
    const addKeyValue = await kv.put(payload.filename, message.data); // (key => file name, value => payload)
    console.log("\n------------------------------------------------")
    console.log(`Recieved message on \"${subj}\"`)
    // console.log("Added to KV Store \nsequence:",message.info.streamSequence, "\nkey:", payload.filename, "\nvalue:", JSON.stringify(jc.decode(message.data)))
    console.log("Added to KV Store \n\nTimestamp: ,",Date.now(),"\n\nkey:", payload.filename, "\nvalue:", JSON.stringify(jc.decode(message.data)))

  }
})();

nc.closed();


//  --- Jetstream manager:
//  // ---- Purge messages from stream  
// await jsm.streams.purge("extractedSheetData");
// await jsm.streams.purge("extractedSheetData", { filter: "extractedSheetData.>" });

// // ---- display stream info 
// console.log("stream info \n");
// const si = await jsm.streams.info("safeInputsDataPipeline5");  
// console.log(si) 

// // ---- List all (jet)stream consumers for a stream
// const stream = "safeInputsDataPipeline5"
// const consumers = await jsm.consumers.list(stream).next();
// consumers.forEach((ci) => {
//     console.log(ci);
// });

// // ---- Delete Consumer 
// // delete a particular consumer
// await jsm.consumers.delete(stream, "testDurableConsumer");

// ----- Create Durable Consumer - This should only be done on set up...(consumer already in use so commented out)
// (also see this with different syntax https://docs.nats.io/using-nats/developer/develop_jetstream/kv)
// const inbox = createInbox();
// await jsm.consumers.add(
//   "safeInputsDataPipeline2", {
//     durable_name: "to_add_to_kv_store_consumer2",
//     // ack_policy: AckPolicy.None, // yeah - don't do this - the messages will continue to come in until acknowledged...
//     ack_wait: nanos(5000000000),
//     // filter_subject('subject to filter')
//     deliver_subject: inbox,
//     deliver_policy: "all", //"new?" https://docs.nats.io/using-nats/developer/develop_jetstream/model_deep_dive
//   });
// const sub = await js.subscribe(subj, opts);
// process messages...


// // ----- Subscribe to message stream (these are currently being published from extract-metadata-content.index.js )
// const subj = "safeInputsDataPipeline7.uppercased.>";
// const sub = await js.subscribe(subj, opts);

// console.log('🚀 Connected to NATS jetstream server...');

// (async () => {
//   for await (const message of sub) {
//     message.ack();
//     var payload  = jc.decode(message.data)

//     // TODO - DO ACTUAL PROCESSING STUFF HERE (here we are just uppercasing to show something.)
//     console.log(payload)
  
//   }
// })();


// await nc.drain();
nc.closed();
