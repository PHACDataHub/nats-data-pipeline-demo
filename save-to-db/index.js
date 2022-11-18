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
    nc.publish("extractedSheetData", jc.encode(payload))
  
  }

// Subscribe and listen to the 'sheetData' service
const sub = nc.subscribe("extractedSheetData");
console.log('🚀 Connected to NATS server...');

(async () => {
  // listen for messages, then parse out just the metadata from the top portion of https://safeinputs.alpha.canada.ca/pagesix
  // as well as the extracted spreadsheet data.
  for await (const message of sub) {
    var payload  = jc.decode(message.data)
    // if (wholePayload.state == 'DONE') {
    const metadata = wholePayload.metadata
    const content = wholePayload.content
    const contentString = JSON.stringify(wholePayload.sheets)
    console.log(
      '\n \n ------------------------------------------------------------- \n ',
      metadata, 
      '\n \n ', 
      contentString,
    )

    }
})();

// don't exit until the client closes
await nc.closed();

