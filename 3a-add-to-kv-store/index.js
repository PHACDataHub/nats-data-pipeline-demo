//#################################################
// 
// index.js (3a-add-to-kv-store)
// 
// Adds messages to NATS KV (Key-Value) Store
// Listens to the jetstream published in 2-transfomation-step-uppercase.index.js.
// ################################################

// references
// https://docs.nats.io/using-nats/developer/develop_jetstream/model_deep_dive
// https://docs.nats.io/using-nats/developer/develop_jetstream/kv

import 'dotenv/config'
import {connect,  JSONCodec, headers, consumerOpts, createInbox, AckPolicy, nanos } from 'nats';
import { replaceNonJetstreamCompatibleCharacters } from './src/helper-functions.js'

const jc = JSONCodec(); 

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

// ----- Add a durable consumer for the jetstream published from 2-transformation-step-uppercase.index.js
const opts = consumerOpts();
opts.durable("safeInputsUppercasedKVConsumer"); 
opts.manualAck();
opts.ackExplicit();
opts.deliverTo(createInbox());

// ----- Create KV Store BUCKET or bind to jetstream if it already exists:
const kv = await js.views.kv("extractedSheetData-kv-store", { history: 10 }); //- note bucket can store from multiple streams 

// ----- Subscribe to message stream (these are currently being published from  2-transfomation-step-uppercase.index.js )
const stream = 'safeInputsUppercased'
const sub = await js.subscribe(`${stream}.>`, opts);
console.log('🚀 Connected to NATS jetstream server...');

(async () => {
  for await (const message of sub) {
    message.ack(); // acknowledge receipt
    var payload  = jc.decode(message.data)

    // Add to KV store
    const kvKey = replaceNonJetstreamCompatibleCharacters(payload.filename)
    const addKeyValue = await kv.put(kvKey, message.data); // (key => file name, value => payload)

     // Display sub subject, timestamp and key/value
    console.log("\n------------------------------------------------")
    console.log ("Recieved on ", message.subject)
    console.log("Added to KV Store \n\nTimestamp: ,",Date.now(),"\n\nkey:", kvKey, "\nvalue:", JSON.stringify(payload))
  }
})();

nc.closed();
