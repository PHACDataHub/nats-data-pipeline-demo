//#################################################
//
// index.js (1-transformation-step-extract-subset-of-data)
// 
// This is an over-simplified transformation - it's just here to show that we can have a real-time data pipeline with 
// some transformations.
//
// ################################################

import 'dotenv/config'
import { connect, JSONCodec, createInbox, AckPolicy, consumerOpts, jwtAuthenticator } from 'nats';

// ---- NATS variables
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS server (https://app.ngs.global/)
const NATS_URL = "demo.nats.io:4222"
const jc = JSONCodec(); // for decoding NATS messages

// Connect to NATS server 
const nc = await connect({ 
  servers: NATS_URL, 
  // authenticator: jwtAuthenticator(jwt), // needed if connected to ngs
});

// ---- Setup Jetstream
const jsm = await nc.jetstreamManager();
const js = nc.jetstream();

// Add a stream to publish on 
const stream = "safeInputsExtractedSubset";
const streamSubj = `safeInputsExtractedSubset.>`;
await jsm.streams.add({ name: stream, subjects: [streamSubj] });
// await jsm.streams.purge(stream); 


function publish(payload, filename) {
    js.publish(`${stream}.${filename}`, jc.encode(payload)) 
  }

// Add consumer to jetstream 
const inbox = createInbox();
await jsm.consumers.add("safeInputsRawSheetData", { // adds consumer to stream
  durable_name: "safeInputsRawSheetDataConsumer",
  ack_policy: AckPolicy.Explicit,
  deliver_subject: inbox,
});
const opts = consumerOpts();

// Bind consumer to jetstream
opts.bind("safeInputsRawSheetData", "safeInputsRawSheetDataConsumer"); //()

// ----- Subscribe to message stream (these are currently being published from 1-transfromation-step-extract-subset-of-data.index.js )
const subj = "safeInputsRawSheetData.>";
const sub = await js.subscribe(subj, opts);
console.log('🚀 Connected to NATS server...');


function replaceNonJetstreamCompatibleCharacters(filename){
    // Jeststream subjects must only contain A-Z, a-z, 0-9, `-`, `_`, `/`, `=` or `.` and cannot start with `.`
// This replaces these characters with '_' (for now)
  const charactersReplaced = filename.replace(/[^a-z-\d_/=.]/gi, "_");
  const spacesReplaced = charactersReplaced.replace(' ', '_')
  return spacesReplaced
}

(async () => {
  // listen for messages, then parse out just the metadata from the top portion of https://safeinputs.alpha.canada.ca/pagesix
  // as well as the extracted spreadsheet data.
  for await (const message of sub) {
    
    var wholePayload  = jc.decode(message.data)
    // message.ack()
    if (wholePayload.state == 'DONE'){
      
      const filename = wholePayload.filename
      const metadata = wholePayload.workbook.Props
      const content = wholePayload.sheets
      const filenameForJetstreamSubject = replaceNonJetstreamCompatibleCharacters(filename)

      console.log(
        '\n \n ------------------------------------------------------------- \nRecieved message on \"sheetData.>\"',
        `\nPublishing the following on \"${stream}.${filenameForJetstreamSubject}\"\n\n`, 
        `Timestamp: ${Date.now()}\n\n`, 
        filename,
        '\n',
        metadata, 
        '\n ', 
        JSON.stringify(content),
      )

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

