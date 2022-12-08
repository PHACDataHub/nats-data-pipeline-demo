//#################################################
// kv_reader.js
// This isn't meant to be run as part of the pipeline; it's only intended to give insight as to how KV Store works
// by reading back particular values and history  
// TODO - add headers in too, get history to work properly, remove nats connection and 
// ################################################

// REFERENCES AND RESOURCES (Also see readme) : 
// https://github.com/nats-io/nats.deno/blob/main/jetstream.md#kv
// https://github.com/nats-io/nats.deno/blob/main/jetstream.md   !!!!!!!!
// (To look at when adding tests) https://codesearch.codelibs.org/search/next/?q=nats&pn=1&num=10&sdh=&
// https://github.com/nats-io/nats.deno/blob/main/jetstream.md#kv
// https://docs.nats.io/using-nats/developer/develop_jetstream/kv

import {StringCodec, connect, nuid, JSONCodec, headers, consumerOpts, createInbox, AckPolicy, nanos } from 'nats';
// TODO bring in headers

// NATS variables
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS server (https://app.ngs.global/)
const NATS_URL = "demo.nats.io:4222"
const nc = await connect({ 
  servers: NATS_URL, 
//   authenticator: jwtAuthenticator(jwt),
});
const sc = StringCodec();
const jc = JSONCodec(); 
const js = nc.jetstream();

// Create jetstream new stream
const jsm = await nc.jetstreamManager();
// const cfg = {
//   name: "safeInputsDataPipeline",
//   subjects: ["safeInputsDataPipeline.>"],
//   max_bytes: 30000000,
// };
// await jsm.streams.add(cfg)  // If needs to be created - use this
// await jsm.streams.update(cfg.name, cfg) //If already exisits - use this
// console.log(`Updated the ${cfg.name} stream ...`)

// // Create durable consumer - This should only be done on set up...(if get message 'consumer already in use', comment this out)
// const inbox = createInbox();
//   await jsm.consumers.add("safeInputsDataPipeline", {
//   durable_name: "to_add_to_kv_store_consumer",
//   ack_policy: AckPolicy.None,
//   ack_wait: nanos(5000000000),
//   // filter_subject('subject to filter')
//   deliver_subject: inbox,
// });

// Bind stream to durable consumer
const opts = consumerOpts();
opts.durable("safeInputsDataPipeline-kv-writer-consumer");
opts.manualAck();
opts.ackExplicit();
opts.deliverTo(createInbox());

opts.bind("safeInputsDataPipeline7", "safeInputsDataPipeline-kv-writer-consumer");
console.log("Durable consumer bound to stream ...")


// create the named KV or bind to it if it exists:
const kv = await js.views.kv("extractedSheetData-kv-store", { history: 10 }); //This can give insight into more than one stream! Note default history is 1 (no history)
console.log("KV Store bound to stream ...\n")

// ----- RETRIEVE DATA ---------
const filename = "test.xlsx";

// ----- See if Key exists in KV Store (this is from the docs:
const buf = [];
const keys = await kv.keys();
await (async () => {
  for await (const k of keys) {
    buf.push(k);
  }
})();
console.log("Keys currently in KV Store:", buf)
console.log(`Keys contain ${filename}: ${buf.includes(filename)}`);

// ----- Get Data
const e = await kv.get(filename);
try{
    console.log(`value for get ${e.key}: ${sc.decode(e.value)}`);
} catch {
    console.log("No value yet for ",filename)
}

// ----- Set up a watch - stream in changes to the KV store (if updates can action) - this is the latest for the keys
const watch = await kv.watch();
(async () => {
  for await (const e of watch) {
    // do something with change - like send an email notification if updates???
    console.log(
        // `\nWatch: \n Key: ${e.key} \n Creation: ${e.created} \n Operation: ${e.operation} \n Value: ${e.value ? sc.decode(e.value) : ""}`,
        `\nWatch: \n Key: ${e.key} \n Creation: ${e.created} \n Operation: ${e.operation} \n Revision: ${e.revision} \n Delta: ${e.delta ? e.delta: ''} \n `//Value: ${e.value ? sc.decode(e.value) : ""}`,

    );
  }
})().then();

// ----- View History - Need to fix so can see further back 
let h = await kv.history({ key: filename, headers_only: false,});
await (async () => {
  for await (const e of h) {
    // do something with the historical value here - e.operation is "PUT", "DEL", or "PURGE"
    console.log(
      `\nHistory: \n Key: ${e.key} \n Creation: ${e.created} \n Operation: ${e.operation} \n Revision: ${e.revision} \n Delta: ${e.delta ? e.delta: ''} \n Value: ${e.value ? sc.decode(e.value) : ""}`,
    );
  }
})();


// ----- NOTES from DOCS on KV - this is what is stored:
// Values in KV are stored as KvEntries:
// {
//   bucket: string,
//   key: string,
//   value: Uint8Array,
//   created: Date,
//   revision: number,
//   delta?: number,
//   operation: "PUT"|"DEL"|"PURGE"
// }
// The operation property specifies whether the value was
// updated (PUT), deleted (DEL) or purged (PURGE).


// // ----- Delete & Purge - the delete/ purge action is recorded
// await kv.delete(filename); // History intact
// await kv.purge(filename); // History values dropped - purge recorded

// stop the watch operation above
// watch.stop();

// danger: destroys all values in the KV!
// await kv.destroy();


// let h = await kv.history({ key: "test.xlsx" });
// await (async () => {
//   for await (const e of h) {
//     // do something with the historical value
//     // you can test e.operation for "PUT", "DEL", or "PURGE"
//     // to know if the entry is a marker for a value set
//     // or for a deletion or purge.
//     console.log(
//       `history: ${e.key}: ${e.operation} ${e.value ? sc.decode(e.value) : ""}`,
//     );
//   }
// })();

// watch.stop(); // stop the watch operation above
// await nc.drain(); // drain the nats connection
// await kv.destroy(); // danger: destroys all values in the KV!