// TODO - need to fix getFile query to take filetype
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql'
import { GraphQLJSON } from 'graphql-type-json'; // JSON is outside of the standard GraphQL scalar types 
import { kv, jc } from './jetstream-kv.js'


const FileType = new GraphQLObjectType({
  name: 'FileType',
  description: "how files are stored in KV Store - will need to expand this to include headers in the future",
  fields: () => ({
      filename: {
        type: GraphQLString, 
        description: "Key in KV Store"
      },
      filedata: { 
        type: new GraphQLNonNull(GraphQLJSON), 
        description: "JSON data from KVStore" 
      },
  }),

});

// const 

export const schema = new GraphQLSchema({
// Defining the [GraphQL](https://graphql.org/) type definitions and resolvers in one go (which is helpful if you have many variables to 
// keep track of)

// File: new GraphQLInputObjectType({
//   name: 'File',
//   description: "how files are stored in KV Store - will need to expand this to include headers in the future",
//   fields: () => ({
//       filename: {
//         type: GraphQLString, 
//         description: "Key in KV Store"
//       },
//       filedata: { 
//         type: new GraphQLNonNull(GraphQLJSON), 
//         description: "JSON data from KVStore" 
//       },
//   }),
// }),

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
          // type: GraphQLString,
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
                  var filename = msg.key
                  var filedata = JSON.stringify(jc.decode(msg.value))
              } catch {
                  console.log("No value yet for ", filename)
                  var filename = "Key not found"
                  var filedata = null
              }
              return {"filename": filename, "filedata": filedata}
              },
          },

    }),
}),

  mutation: new GraphQLObjectType({
  // GraphQL ensures that variables match the types defined in the schema. This mutation acts as a filter;  
  // allowing only valid JSON formated data through. (And if valid will be publish via nats.) 
  name: 'Mutation',
  fields: { 
      verifyJsonFormat: {
          type: GraphQLJSON,
          args: {
              sheetData: { type: new GraphQLNonNull(GraphQLJSON) },
              },
          async resolve(_parent, { sheetData }, { publish }, _info) {
              console.log(JSON.stringify(sheetData))
              // const doTheStuff = publish(sheetData);  // where the NATs publish is called from index.js 
              return sheetData;
              },
          },

      addFileToKVStore: {
          description: "Add JSON data to the KV stream *will need connection to stream etc.. and expand this out to work further",
          type: GraphQLJSON,
          args: {
              filename: { type: new GraphQLNonNull(GraphQLString) },
              filedata: { type: new GraphQLNonNull(GraphQLJSON) },
              },
          async resolve(_parent, {filename, filedata} , { publish }, _info) {
              // console.log(args)
              console.log(filename)
              console.log(JSON.stringify(filedata))
              const addKeyValue = await kv.put(filename, jc.encode(filedata));
              return {filename, filedata};
              },
          },
      },
  }),
});
