import 'dotenv/config'
import { connect, JSONCodec, jwtAuthenticator } from 'nats';

// NATS variables
const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS server (https://app.ngs.global/)
const jc = JSONCodec(); // for decoding NATS messages

// Connect to NATS server using jwt authentication 
const nc = await connect({ 
  servers: NATS_URL, 
  authenticator: jwtAuthenticator(jwt),
});

function publish(payload) {
    // Publishes payload of json valid spreadsheet data via NATS. Called in GraphQL resolver.
    nc.publish("sheetData", jc.encode(payload))
  
  }

// Subscribe and listen to the 'sheetData' service
const sub = nc.subscribe("sheetData");
console.log('🚀 Connected to NATS server...');

(async () => {
  // listen for messages, then parse out just the metadata from the top portion of https://safeinputs.alpha.canada.ca/pagesix
  // as well as the extracted spreadsheet data.
  for await (const message of sub) {
    var wholePayload  = jc.decode(message.data)
    // if (wholePayload.state == 'DONE') {
    const metaData = wholePayload.workbook.Props
    const content = wholePayload.sheets
    const contentString = JSON.stringify(wholePayload.sheets)
    // const metaDataContentPayload = metaData.concat(content) 
    console.log(
        // JSON.stringify(metaDataContentPayload)
    '\n \n ------------------------------------------------------------- \n ', metaData, 
    '\n \n ', contentString,
    )
    // }

  console.log("subscription closed");
    }
})();

// don't exit until the client closes
await nc.closed();

