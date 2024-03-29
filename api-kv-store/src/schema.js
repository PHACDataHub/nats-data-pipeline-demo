// TODO - need to fix getFile query to take filetype
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql'
import {connect,  JSONCodec, jwtAuthenticator  } from 'nats';
import { GraphQLJSON } from 'graphql-type-json'; // JSON is outside of the standard GraphQL scalar types 
// import { kv, jc } from './jetstream-kv.js'

// const jc = JSONCodec(); 

// // ----- NATS Connection ----- 
// // const jwt = process.env.NATS_JWT  // expected NATS_JWT value stored .env if running locally or as kubernetes secret env variable
// // const NATS_URL = "tls://connect.ngs.global:4222"  // Synadia's NATS NGS server (https://app.ngs.global/)
// const NATS_URL = "demo.nats.io:4222" // Synadia's NATS demo server
// const nc = await connect({ 
//   servers: NATS_URL, 
// //   authenticator: jwtAuthenticator(jwt), // Needed if using NGS server
// });

// // ----- Jetstream client
// const js = nc.jetstream();

// // ----- create the named KV or bind to it if it exists:
// const kv = await js.views.kv("test-kv-store", { history: 10 }); //This can give insight into more than one stream! Note default history is 1 (no history)
// console.log("KV Store bound to stream ...\n")


const FileType = new GraphQLObjectType({
  name: 'FileType',
  description: "File retrieval information from value out of KV Store - will need to expand this to include headers in the future",
  fields: () => ({
      filename: {
        type: GraphQLString, 
        description: "Key in KV Store"
      },
      metadata: { 
        type: new GraphQLNonNull(GraphQLJSON), 
        description: "JSON data from KVStore" 
      },
      // Can break down metadata information to include Author etc as those are stable
      content: { 
        type: new GraphQLNonNull(GraphQLJSON), 
        description: "JSON data from KVStore" 
      },
  }),

});


export const schema = new GraphQLSchema({
// Defining the [GraphQL](https://graphql.org/) type definitions and resolvers in one go (which is helpful if you have many variables to 
// keep track of)

  query: new GraphQLObjectType({
  // Used for testing purposes at this time.
    name: 'Query',
    fields: () => ({
        hello: {
            type: GraphQLString,
            resolve(_parent, _args, _context, _info) {
                return 'world!'
                },
            },
        
        getFile: {
          // TODO - need to fix getFile query to take filetype
            // type: FileType,
            type: GraphQLJSON,
            description: "Pulls file data out of the KV store given when provided a filename.",
            args: {
              filename: {type: GraphQLString},
            },
            // resolve: (parent, { filename }) => "filename",
            async resolve(parent, { filename }){
                const msg = await kv.get(filename);
                try{
                    console.log(`value for get ${msg.key}: ${JSON.stringify(jc.decode(msg.value))}`);
                } catch {
                    console.log("Something went wrong - could not find", filename)
                }
                return jc.decode(msg.value)
                },
            }
      //     getHistory: {
      //       type: GraphQLJSON,
      //       description: "Retrieve history for a particular filename.",
      //       args: {
      //         filename: {type: GraphQLString},
      //       },
      //       // resolve: (parent, { filename }) => "filename",
      //       async resolve(parent, { filename }){
      //         await history( // https://docs.nats.io/using-nats/developer/develop_jetstream/kv
      //           opts: { key?: string; headers_only?: boolean } = {},
      //         ): Promise<QueuedIterator<KvEntry>>
      //       },
      // }
      
    }),
  }),

    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: { 
          addFileToKVStore: {
              description: "Add JSON data to the KV stream *will need connection to stream etc.. and expand this out to work further",
              type: GraphQLJSON,
              args: {
                  filename: { type: new GraphQLNonNull(GraphQLString) },
                  // metadata: { type: GraphQLString },
                  content: { type: GraphQLJSON },
                  },
                  // async resolve(_parent, args , _context, _info) {
                  //   console.log(args);
                    
              async resolve(_parent, {filename,  content} , _context, _info) {
                  // console.log(args)
                  console.log(filename)
                  // console.log(metadata)
                  console.log(JSON.stringify(content))
                  var valueToAddToStore ={
                    "filename": filename, 
                    // "metadata": metadata,
                    "content": content
                  }

                  const addKeyValue = await kv.put(filename, jc.encode(valueToAddToStore));
                  return valueToAddToStore;
                },
            },
        },
    }),
  
});
