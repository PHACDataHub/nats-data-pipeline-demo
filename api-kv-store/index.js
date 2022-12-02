// Import modules
import 'dotenv/config'
// import { Server } from './src/Server.js'
import { schema } from './src/schema.js'

import express from "express";
import { createYoga } from "graphql-yoga" // GraphQL yoga server

const {
    PORT = 3000,
    HOST = '0.0.0.0',
  } = process.env;

const yoga = createYoga({
  schema,
});
const app = express();
app.use("/", yoga);


// function readFromKVStore (filename){
//   // get from KVstream 
//   const fileData = filename
//   return(fileData)
// }

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
  // const server = new Server({
  //   schema,
    // context: { readFromKVStore },
  // })

  const server = app
  server.listen({ port: PORT, host: HOST }, () =>
    console.log(`🚀 Safe-inputs API listening on ${HOST}:${PORT}`),
  )
})()
