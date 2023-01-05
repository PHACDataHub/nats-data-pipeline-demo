// Import NATS
import 'dotenv/config'
import {StringCodec, connect, nuid, JSONCodec, headers, consumerOpts, createInbox, AckPolicy, nanos, jwtAuthenticator  } from 'nats';

// NATS variables
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value if using ngs - stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS server (https://app.ngs.global/)
const {
    PORT = 3000,
    HOST = '0.0.0.0',
    NATS_URL = "demo.nats.io:4222", // Uncomment this to use demo server
    // NATS_URL = "tls://connect.ngs.global:4222", // Comment this out to use demo server
  } = process.env;

const nc = await connect({ 
  servers: NATS_URL, 
//   authenticator: jwtAuthenticator(jwt), // need if using ngs
});

// ----- Jetstream managment
export const jc = JSONCodec(); 
const js = nc.jetstream();
const jsm = await nc.jetstreamManager();

// ----- Add a stream
const stream = "safeInputsUppercased";
const subj = `safeInputsUppercased.>`;
await jsm.streams.add({ name: stream, subjects: [subj] });

// ----- Bind stream to durable consumer
const opts = consumerOpts();

try{
  const inbox = createInbox();
  await jsm.consumers.add("safeInputsUppercased", { // stream
    durable_name: "safeInputsUppercasedKVConsumer",
    ack_policy: AckPolicy.Explicit,
    deliver_subject: inbox,
  });
}catch(e){}

// Bind consumer to stream
opts.bind("safeInputsUppercased", "safeInputsUppercasedKVConsumer");
console.log("Durable consumer bound to stream ...")

// ----- create the named KV or bind to it if it exists:
export const kv = await js.views.kv("extractedSheetData-kv-store", { history: 10 }); //This can give insight into more than one stream! Note default history is 1 (no history)
console.log("KV Store bound to stream ...\n")