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

// add a stream
const stream = "safeInputsDataPipeline7";
const subj = `safeInputsDataPipeline7.>`;
await jsm.streams.add({ name: stream, subjects: [subj] });

// Bind stream to durable consumer
const opts = consumerOpts();
// opts.durable("safeInputsDataPipeline-kv-writer-consumer");
opts.durable("step3Consumer")
opts.manualAck();
opts.ackExplicit();
opts.deliverTo(createInbox());

// opts.bind("safeInputsDataPipeline7", "safeInputsDataPipeline-kv-writer-consumer");
opts.bind("safeInputsDataPipeline7", "step3Consumer");
console.log("Durable consumer bound to stream ...")

// create the named KV or bind to it if it exists:
export const kv = await js.views.kv("extractedSheetData-kv-store", { history: 10 }); //This can give insight into more than one stream! Note default history is 1 (no history)
console.log("KV Store bound to stream ...\n")