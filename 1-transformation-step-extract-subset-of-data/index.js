//#################################################
//
// index.js (1-transformation-step-extract-subset-of-data)
// 
// This is an simplified transformation - it's just here to show that we can have a real-time data pipeline with 
// some transformations. This service extracts only the details displayed on the ui when 'uploading' a spreadsheet 
// to https://safeinputs.alpha.canada.ca/
//
// ################################################

import 'dotenv/config'
import { connect, JSONCodec, createInbox, AckPolicy, consumerOpts, jwtAuthenticator } from 'nats';
import { replaceNonJetstreamCompatibleCharacters } from './src/helper-functions.js'

const jc = JSONCodec(); // for byte decoding/ encoding NATS messages

// ----- NATS Connection -----
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS server (https://app.ngs.global/)
const NATS_URL = "demo.nats.io:4222"  // if want a more secure connection, use NGS or own nats cluster
const nc = await connect({ 
  servers: NATS_URL, 
  // authenticator: jwtAuthenticator(jwt), // needed if connected to ngs
});

// ----- Stream Management ----- 
const jsm = await nc.jetstreamManager();
const js = nc.jetstream();

// ----- Add a jetstream to publish on
const pubStream = "safeInputsExtractedSubset";
await jsm.streams.add({ name: pubStream, subjects: [`${pubStream}.>`] }); 

function publish(payload, filename) {
    // Publishes byte encoded payload 
    js.publish(`${pubStream}.${filename}`, jc.encode(payload)) 
  }

// ----- Create a durable consumer(for subscriptions - with memeory of what it has previously consumed)
const opts = consumerOpts();
const stream = "safeInputsRawSheetData"

try { // Inital consumer set up (only used on set up otherwise gives 'consumer in use' error)
  const inbox = createInbox();  // to enable messages to be stored separately on NATS server for various consumers 
  await jsm.consumers.add(stream, { 
    durable_name: "safeInputsRawSheetDataConsumer",
    ack_policy: AckPolicy.Explicit,
    deliver_subject: inbox,
  });
  opts.bind(stream, "safeInputsRawSheetDataConsumer"); // Bind consumer to jetstream
} catch (e){
  console.log(e) //NatsError: consumer name already in use //TODO: Handle this 
}

// ----- Subscribe to message stream (these are currently being published from safe inputs )
const sub = await js.subscribe(`${stream}.>`, opts);
console.log('🚀 Connected to NATS jetstream server...');

(async () => {
  // listen for messages, then parse out just the metadata from the top portion of https://safeinputs.alpha.canada.ca/pagesix
  // as well as the extracted spreadsheet data.
  for await (const message of sub) {
    message.ack()
    var payload  = jc.decode(message.data) // message was byte encoded
    if (payload.state == 'DONE'){
      const filename = payload.filename 
      const metadata = payload.workbook.Props
      const content = payload.sheets
      const filenameForJetstreamSubject = replaceNonJetstreamCompatibleCharacters(filename)

      // Display sub and pub subjects, timestamp and data after transformation
      console.log(
        '\n \n ------------------------------------------------------------- \n',
        'Recieved message on \"sheetData.>\"',
        `\nPublishing the following on \"${pubStream}.${filenameForJetstreamSubject}\"\n\n`, 
        `Timestamp: ${Date.now()}\n\n`, 
        filename,
        '\n',
        metadata, 
        '\n ', 
        JSON.stringify(content),
      )
      
       // TODO - DO ACTUAL PROCESSING STUFF HERE (here we are just selecting to show something.)

      // Publish new payload
      var newPayload = {
        "filename": filename, 
        "metadata": metadata,
        "content": content
      } 
      publish(newPayload, filenameForJetstreamSubject) 
    }
  }
})();

await nc.closed();

