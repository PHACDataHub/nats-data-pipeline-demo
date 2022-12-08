import 'dotenv/config'
import { connect, JSONCodec, jwtAuthenticator } from 'nats';

// NATS variables
// const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS server (https://app.ngs.global/)
const NATS_URL = "demo.nats.io:4222"
const jc = JSONCodec(); // for decoding NATS messages

// Connect to NATS server using jwt authentication 
const nc = await connect({ 
  servers: NATS_URL, 
  // authenticator: jwtAuthenticator(jwt),
});

// Setup jetstream
const jsm = await nc.jetstreamManager();
const js = nc.jetstream();

// add a stream
const stream = "safeInputsDataPipeline7";
const subj = `safeInputsDataPipeline7.>`;
await jsm.streams.add({ name: stream, subjects: [subj] });

function publish(payload, filename) {
    js.publish(`safeInputsDataPipeline7.extractedData.${filename}`, jc.encode(payload)) // This needs to be js but having timeouts - still debugging
  }

// Subscribe and listen to the 'sheetData' stream
const sub = nc.subscribe("sheetData");
console.log('🚀 Connected to NATS server...');

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
      console.log(
        '\n \n ------------------------------------------------------------- \nRecieved message on \"sheetData\" subject',
        `\nPublishing the following on safeInputsDataPipeline7.extractedData.filename\n\n`, 
        // `\nPublishing the following on safeInputsDataPipeline7.extractedData.${filename}\n\n`, 
        `Timestamp: ${Date.now()}\n\n`, 
        filename,
        '\n',
        metadata, 
        '\n ', 
        JSON.stringify(content),
      )
      // console.log('\n--------------------------------------\n',JSON.stringify(wholePayload))

      var newPayload = {
        "filename": filename, 
        "metadata": metadata,
        "content": content
      } 
      publish(newPayload, "filenames") //"`safeInputsDataPipeline.extractedData.${filename}" 
    }
  }
})();

// don't exit until the client closes
await nc.closed();

