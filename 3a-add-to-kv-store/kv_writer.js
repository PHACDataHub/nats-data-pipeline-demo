//#################################################
// kv_writer.js
// This consumes published messages and adds them to a Key-Value (KV) Store (A materialized view on top of jetstream)
// We can pull these messages back out with kv_reader.js (But will be placing a GraphQL API to pull back messages next)
// ################################################

// TODO - add HEADERS, GET HISTORY to work 

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
// const cfg = {
//   name: "safeInputsDataPipeline5",
//   subjects: ["safeInputsDataPipeline5.>"],
//   max_bytes: 30000000,
// };
// await jsm.streams.add(cfg)  // On stream creation - use this (comment out below)
// // await jsm.streams.update(cfg.name, cfg) // If already exisits - use this (comment out above)
// console.log(`Updated the ${cfg.name} stream ...`)

const js = nc.jetstream();

//  --- Jetstream manager:
//  // ---- Purge messages from stream  
// await jsm.streams.purge("extractedSheetData");
// await jsm.streams.purge("extractedSheetData", { filter: "extractedSheetData.>" });

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

// ----- Bind stream to durable consumer (with memeory of what it has previously consumed)
// (Note -consumers can consume messages from more than one stream)
const opts = consumerOpts();
opts.durable("safeInputsDataPipeline-kv-writer-consumer");
opts.manualAck();
opts.ackExplicit();
opts.deliverTo(createInbox());

opts.bind("safeInputsDataPipeline5", "safeInputsDataPipeline-kv-writer-consumer");

// ----- Create KV Store BUCKET or bind to jetstream if it exists:
const kv = await js.views.kv("extractedSheetData-kv-store", { history: 10 }); //- note bucket can store from multiple streams 

// // ---- display stream info 
// console.log("stream info \n");
// const si = await jsm.streams.info("safeInputsDataPipeline5");  
// console.log(si) 


// ----- Subscribe to message stream (these are currently being published from extract-metadata-content.index.js )
// const sub = await js.subscribe("safeInputsDataPipeline.extractedData.>", opts);
const subj = "safeInputsDataPipeline5.uppercased.>";
const sub = await js.subscribe(subj, opts);
// const sub = await js.subscribe("safeInputsDataPipeline5.uppercased.>", opts);
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
    console.log("Added to KV Store \nkey:", payload.filename, "\nvalue:", JSON.stringify(jc.decode(message.data)))

  }
})();


// await nc.drain();
nc.closed();
