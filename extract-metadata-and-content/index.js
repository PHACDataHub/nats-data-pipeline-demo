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
const cfg = {
  name: "extractedSheetData2",
  subjects: ["extractedSheetData2.>"],
  max_bytes: 30000000,
};
// await jsm.streams.add(cfg)  // If needs to be created - use this
await jsm.streams.update(cfg.name, cfg) //If already exisits - use this
console.log(`Updated the ${cfg.name} stream ...`)
const js = nc.jetstream();

function publish(payload, filename) {
    // console.log(`extractedSheetData.${filename}`, payload)
    // nc.publish(`extractedSheetData.${filename}`, jc.encode(payload))
    js.publish(`extractedSheetData2.${filename}`, jc.encode(payload)) // change to jetstream
  }

// Subscribe and listen to the 'sheetData' service
const sub = nc.subscribe("sheetData");
console.log('🚀 Connected to NATS server...');

(async () => {
  // listen for messages, then parse out just the metadata from the top portion of https://safeinputs.alpha.canada.ca/pagesix
  // as well as the extracted spreadsheet data.
  for await (const message of sub) {
    var wholePayload  = jc.decode(message.data)
    if (wholePayload.state == 'DONE'){
      const filename = wholePayload.filename
      const metadata = wholePayload.workbook.Props
      const content = wholePayload.sheets
      // console.log(
      //   '\n \n ------------------------------------------------------------- \n ',
      //   filename,
      //   '\n \n',
      //   metadata, 
      //   '\n \n ', 
      //   JSON.stringify(content),
      // )
      console.log('\n--------------------------------------\n',JSON.stringify(wholePayload))

      // const newPayload = [filename, metadata, content] // change to json below
      var newPayload = {
        "filename": filename, 
        "metadata": metadata,
        "content": content
      }
      // console.log(JSON.stringify(newPayload))
      // publish(newPayload, filename) // will publish on "extractedSheetData.${filename}" 
      publish(newPayload)
    }
  }
})();

// don't exit until the client closes
await nc.closed();

