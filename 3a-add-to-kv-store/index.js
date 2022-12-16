//#################################################
// 
// index.js (3a-add-to-kv-store)
// 
// Adds messages to NATS KV (Key-Value) Store
// Listens to the jetstream published by 2-transfomation-step-uppercase.index.js.
// ################################################

import 'dotenv/config'
import {connect,  JSONCodec, headers, consumerOpts, createInbox, AckPolicy, nanos } from 'nats';

// ----- Create NATS Connection ----- 
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS NGS server (https://app.ngs.global/)
const NATS_URL = "demo.nats.io:4222" // Synadia's NATS demo server
const nc = await connect({ 
  servers: NATS_URL, 
//   authenticator: jwtAuthenticator(jwt), // Needed if using NGS server
});

const jc = JSONCodec(); 

// ----- STREAM MANAGEMENT 
const jsm = await nc.jetstreamManager();
const js = nc.jetstream();

// ----- Add a consumer for the stream published from 2-transformation-step-uppercase.index.js
const inbox = createInbox();
await jsm.consumers.add("safeInputsUppercased", { // stream
  durable_name: "safeInputsUppercasedKVConsumer",
  ack_policy: AckPolicy.Explicit,
  deliver_subject: inbox,
});

const opts = consumerOpts();
opts.bind("safeInputsUppercased", "safeInputsUppercasedKVConsumer");
console.log("Durable consumer bound to stream ...")

// ----- Create KV Store BUCKET or bind to jetstream if it exists:
const kv = await js.views.kv("extractedSheetData-kv-store", { history: 10 }); //- note bucket can store from multiple streams 

// ----- Subscribe to message stream (these are currently being published from  2-transfomation-step-uppercase.index.js )
const subj = "safeInputsUppercased.>";
const sub = await js.subscribe(subj, opts);

console.log('🚀 Connected to NATS jetstream server...');

function replaceNonJetstreamCompatibleCharacters(filename){
    // Jeststream subjects must only contain A-Z, a-z, 0-9, `-`, `_`, `/`, `=` or `.` and cannot start with `.`
// This replaces these characters with '_' (for now)
  const charactersReplaced = filename.replace(/[^a-z-\d_/=.]/gi, "_");
  const spacesReplaced = charactersReplaced.replace(' ', '_')
  return spacesReplaced
}

(async () => {
  for await (const message of sub) {
    message.ack(); // acknowledge receipt
    var payload  = jc.decode(message.data)
    const kvKey = replaceNonJetstreamCompatibleCharacters(payload.filename)
    
    const addKeyValue = await kv.put(kvKey, message.data); // (key => file name, value => payload)

    console.log("\n------------------------------------------------")
    console.log ("Recieved on ", message.subject)
    console.log("Added to KV Store \n\nTimestamp: ,",Date.now(),"\n\nkey:", kvKey, "\nvalue:", JSON.stringify(jc.decode(message.data)))
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

// // retrieve a consumer's configuration
// const ci = await jsm.consumers.info("safeInputsDataPipelineTest", "step3aConsumer");
// console.log(ci);

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

// await nc.drain();
nc.closed();
