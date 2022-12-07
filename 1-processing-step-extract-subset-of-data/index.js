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
// const cfg = {
//   name: "safeInputsDataPipeline4",
//   subjects: ["safeInputsDataPipeline4.>"],
//   max_bytes: 30000000,
//   // ack_wait: 50000,
//   // no_ack: true,
//   ack_policy: "none",
// };
// await jsm.streams.add(cfg)  // If needs to be created - use this
// await jsm.streams.update(cfg.name, cfg) //If already exisits - use this
// console.log(`Updated the ${cfg.name} stream ...`)

// add stream 

const js = nc.jetstream();

// add a stream
const stream = "safeInputsDataPipeline5";
const subj = `safeInputsDataPipeline5.>`;
await jsm.streams.add({ name: stream, subjects: [subj] });

function publish(payload, filename) {
    js.publish(`safeInputsDataPipeline5.extractedData.${filename}`, jc.encode(payload)) // This needs to be js but having timeouts - still debugging
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
        `\nPublishing the following on safeInputsDataPipeline5.extractedData.${filename}\n\n`, 
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
      publish(newPayload) //"`safeInputsDataPipeline.extractedData.${filename}" 
    }
  }
})();

// don't exit until the client closes
await nc.closed();

