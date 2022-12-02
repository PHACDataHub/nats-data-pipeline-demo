// Import NATS
import {StringCodec, connect, nuid, JSONCodec, headers, consumerOpts, createInbox, AckPolicy, nanos, jwtAuthenticator  } from 'nats';
// TODO bring in headers

// NATS variables
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS server (https://app.ngs.global/)
const {
    PORT = 3000,
    HOST = '0.0.0.0',
    NATS_URL = "demo.nats.io:4222", // Uncomment this to use demo server
    // NATS_URL = "tls://connect.ngs.global:4222", // Comment this out to use demo server
  } = process.env;

const nc = await connect({ 
  servers: NATS_URL, 
//   authenticator: jwtAuthenticator(jwt),
});
const sc = StringCodec();
export const jc = JSONCodec(); 
const js = nc.jetstream();

// Create jetstream new stream
const jsm = await nc.jetstreamManager();
const cfg = {
  name: "extractedSheetData2",
  subjects: ["extractedSheetData2.>"],
  max_bytes: 30000000,
};
// await jsm.streams.add(cfg)  // If needs to be created - use this
await jsm.streams.update(cfg.name, cfg) //If already exisits - use this
console.log(`Updated the ${cfg.name} stream ...`)

// // Create durable consumer - This should only be done on set up...(if get message 'consumer already in use', comment this out)
// const inbox = createInbox();
//   await jsm.consumers.add("extractedSheetData2", {
//   durable_name: "testDurableConsumer",
//   ack_policy: AckPolicy.None,
//   ack_wait: nanos(5000000000),
//   // filter_subject('subject to filter')
//   deliver_subject: inbox,
// });

// Bind stream to durable consumer
const opts = consumerOpts();
opts.bind("extractedSheetData2", "testDurableConsumer");
console.log("Durable consumer bound to stream ...")

// create the named KV or bind to it if it exists:
export const kv = await js.views.kv("extractedSheetData-kv-store", { history: 10 }); //This can give insight into more than one stream! Note default history is 1 (no history)
console.log("KV Store bound to stream ...\n")