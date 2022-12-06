//#################################################
// kv_writer.js
// This consumes published messages and adds them to a Key-Value (KV) Store (A materialized view on top of jetstream)
// We can pull these messages back out with kv_reader.js (But will be placing a GraphQL API to pull back messages next)
// ################################################

// TODO - add HEADERS, clean, refactor GET HISTORY to work (look at max age and discard config?)

//  ---- REFERENCES AND RESOURCES (Also see READme) : 
// https://github.com/nats-io/nats.deno/blob/main/jetstream.md#kv
// https://github.com/nats-io/nats.deno/blob/main/jetstream.md   !!!!!!!!
// (To look at when adding tests) https://codesearch.codelibs.org/search/next/?q=nats&pn=1&num=10&sdh=&
// https://github.com/nats-io/nats.deno/blob/main/jetstream.md#kv
// https://docs.nats.io/using-nats/developer/develop_jetstream/kv
// https://github.com/nats-io/nats.go/blob/main/kv.go

import {StringCodec, connect, nuid, JSONCodec, headers, consumerOpts, createInbox, AckPolicy, nanos } from 'nats';

// ----- Create NATS Connection ----- 
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS NGS server (https://app.ngs.global/)
const NATS_URL = "demo.nats.io:4222" // Synadia's NATS demo server
const nc = await connect({ 
  servers: NATS_URL, 
//   authenticator: jwtAuthenticator(jwt), // Needed if using NGS server
});
// const sc = StringCodec();
const jc = JSONCodec(); 

// ----- STREAM MANAGEMENT ----- (TODO - extract this whole section)
// ----- Create jetstream - new stream
const jsm = await nc.jetstreamManager();
const cfg = {
  name: "extractedSheetData2",
  subjects: ["extractedSheetData2.>"],
  max_bytes: 30000000,
};
// // await jsm.streams.add(cfg)  // On stream creation - use this (comment out below)
await jsm.streams.update(cfg.name, cfg) // If already exisits - use this (comment out above)
console.log(`Updated the ${cfg.name} stream ...`)

const js = nc.jetstream();

//  --- Jetstream manager:
//  // ---- Purge messages from stream  
// await jsm.streams.purge("extractedSheetData");
// await jsm.streams.purge("extractedSheetData", { filter: "extractedSheetData.>" });

// // ---- List all (jet)stream consumers for a stream
// const stream = "extractedSheetData2"
// const consumers = await jsm.consumers.list(stream).next();
// consumers.forEach((ci) => {
//     console.log(ci);
// });

// // ---- Delete Consumer 
// // delete a particular consumer
// await jsm.consumers.delete(stream, "testDurableConsumer");

// // ----- Create Durable Consumer - This should only be done on set up...(consumer already in use so commented out)
// // (also see this with different syntax https://docs.nats.io/using-nats/developer/develop_jetstream/kv)
// const inbox = createInbox();
// await jsm.consumers.add(
//   "extractedSheetData2", {
//     durable_name: "testDurableConsumer",
//     ack_policy: AckPolicy.None,
//     ack_wait: nanos(5000000000),
//     // filter_subject('subject to filter')
//     deliver_subject: inbox,
//     deliver_policy: "all", //"new?" https://docs.nats.io/using-nats/developer/develop_jetstream/model_deep_dive
//   });

// ----- Bind stream to durable consumer (with memeory of what it has previously consumed)
// (Note -consumers can consume messages from more than one stream)
const opts = consumerOpts();
opts.bind("extractedSheetData2", "testDurableConsumer");

// ----- Create KV Store BUCKET or bind to jetstream if it exists:
const kv = await js.views.kv("extractedSheetData-kv-store", { history: 10 }); //- note bucket can store from multiple streams 
// const kv = await js.views.kv("extractedSheetData-kv-store");

// ---- display stream info 
console.log("stream info \n");
const si = await jsm.streams.info("extractedSheetData2");  
console.log(si) 


// ----- Subscribe to message stream (these are currently being published from extract-metadata-content.index.js )
const sub = await js.subscribe("extractedSheetData2.>", opts);
console.log('🚀 Connected to NATS jetstream server...');

const done = (async () => {
  // listen for published messages via "extractedSheetData2.>" NATS subject
  for await (const message of sub) {
    message.ack(); // acknowledge receipt
    var payload  = jc.decode(message.data);
    
    // replace whitespace in filename (throws error if used in KV key)
    // payload.filename = payload.filename.replace(/ /g,"_");  ("/[^A-Za-z0-9\.]/", "_")
    payload.filename = payload.filename.replace(/ /g,"_")
    payload.filename = payload.filename.replace(")","_")
    payload.filename = payload.filename.replace("(","_")
    // console.log("FIXED FILENAME: ", payload.filename)
    // console.log(payload)
    const addKeyValue = await kv.put(payload.filename, message.data); // (key => file name, value => payload)
    console.log("\n------------------------------------------------")
    console.log("Added to stream \nsequence:",message.info.streamSequence, "\nkey:", payload.filename, "\nvalue:", JSON.stringify(jc.decode(message.data)))
  }
})();

await done;
await nc.drain();
