// NATS connections

import {connect,  JSONCodec, jwtAuthenticator  } from 'nats';

export const jc = JSONCodec(); 

// ----- NATS Connection ----- 
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS NGS server (https://app.ngs.global/)
const NATS_URL = "demo.nats.io:4222" // Synadia's NATS demo server
const nc = await connect({ 
  servers: NATS_URL, 
//   authenticator: jwtAuthenticator(jwt), // Needed if using NGS server
});

// ----- Jetstream client
const js = nc.jetstream();

// ----- create the named KV or bind to it if it exists:
export const kv = await js.views.kv("test-kv-store", { history: 10 }); //This can give insight into more than one stream! Note default history is 1 (no history)
console.log("KV Store bound to stream ...\n")