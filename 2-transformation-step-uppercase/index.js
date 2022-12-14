//#################################################
//
// index.js (2-transformation-step-uppercase)
//
// This is an over-simplified transformation - it's just here to show that we can have a real-time data pipeline with 
// some transformations. Listens to jetstream that 1-transfomation-step-extract-subset-of-data.index.js publishes on.
// ################################################

// TODO - maybe try https://github.com/hmenyus/node-calls-python for numpy transformations?
import 'dotenv/config'
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
const jsm = await nc.jetstreamManager();
const js = nc.jetstream();

// ----- Add a stream to publish on
const stream = "safeInputsUppercased"
const streamSubj = `safeInputsUppercased.>`;

await jsm.streams.add({ name: stream, subjects: [streamSubj] });

function publish(payload, filename) {
  js.publish(`${stream}.${filename}`, jc.encode(payload)) 
}

// ----- Create a durable consumer (with memeory of what it has previously consumed)
// // (Note -consumers can consume messages from more than one stream)
const inbox = createInbox();
await jsm.consumers.add("safeInputsExtractedSubset", { // adds consumer to stream
  durable_name: "safeInputsExtractedSubsetConsumer",
  ack_policy: AckPolicy.Explicit,
  deliver_subject: inbox,
});
const opts = consumerOpts();

// Bind consumer to jetstream
opts.bind("safeInputsExtractedSubset", "safeInputsExtractedSubsetConsumer"); //()

// ----- Subscribe to message stream (these are currently being published from 1-transfromation-step-extract-subset-of-data.index.js )
const subj = "safeInputsExtractedSubset.>";
const sub = await js.subscribe(subj, opts);

console.log('🚀 Connected to NATS jetstream server...');


function capitalize(object) { 
   // https://www.quora.com/How-do-I-capitalize-keys-and-values-in-JSON-object-recursively
	var isArray = Array.isArray(object); 
	for (let key in object) { 
		let value = object[key]; 
		let newKey = key; 
		if (!isArray) { // if it is an object 
			delete object[key]; // firstly remove the key 
			newKey = key.toUpperCase(); // secondly generate new key (capitalized) 
		} 
		let newValue = value; 
		if (typeof value != "object") { // if it is not an object (array or object in fact), stops here 
			if (typeof value == "string") { 
				newValue = value.toUpperCase(); // if it is a string, capitalize it 
			} 
		} else { // if it is an object, recursively capitalize it 
			newValue = capitalize(value); 
		} 
		object[newKey] = newValue; 
	} 
	return object; 
} 

function printPayload(payload) { 
  for (var i = 0; i < payload.content.length; ++i) {
    console.log(JSON.stringify(payload.content[i]))
    // payload.content[i].data = capitalize(payload.content[i].data)
  }
}

(async () => {
  for await (const message of sub) {
    message.ack();
    var payload  = jc.decode(message.data)


    // TODO - DO ACTUAL PROCESSING STUFF HERE (here we are just uppercasing to show something.)

    // go through each sheet and capitalize the data part
    for (var i = 0; i < payload.content.length; ++i) {
      payload.content[i].data = capitalize(payload.content[i].data)
  }

    // console.log(
    //   `\n\n---------------------------\n\n`,
    //   `Recieved message on \"${subj}\"\n`,
    //   `Publishing the following on \"${stream}.filename\"\n\n`, 
    //   `Timestamp: ${Date.now()}\n\n`, 

    //   `{\nfilename: ${payload.filename},\n 
    //   metadata: ${payload.metadata},\n
    //   content: `,printPayload(payload), `\n
    // }`)
    console.log(JSON.stringify(payload))
  
    publish(payload, "filename") 
  }
})();


// await nc.drain();
nc.closed();
