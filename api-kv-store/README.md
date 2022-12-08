# API for NATS KV (Key Value) Store

This is an API used to interact with the KV Store.  Any files input through the [Safe Inputs](https://safeinputs.alpha.canada.ca/) UI while this pipeline is running should reside within the KV Store and can be accessed through this API. You can also add new file data to the KV Store here.  

#### TODO
* There is an issue with the getFile schema (limiting query options - would like it to be of type "FileType").
* Need to expand to include retrieval of historic values (right now it's still only the last value).
* Leverage Graphql-yoga 3's file loading capability to upload into the stream through this API.
* Fix the server test issue caused by migration from Graphql-yoga v2 -> v3

## Installing dependencies
```
npm install
```

## Running it
```
$ npm start 
```
Open the Graphical interface (http://localhost:3000/) and interact with the store.

### Add to the stream
```
mutation {
    addFileToKVStore (
      filename:"More_file_data.xlsx",
      filedata: {a:3}
    )
  }
```
Note - until the history is fixed in the kv-store module, if you add new data through this mutation with the same filename as an exisiting file in the store, the old file will be overwritten. 

### Retrieve file
```
{getFile(filename:"test.xlsx")}
```
Replace filename with one from a file you've added. 

## Running the tests

```
npm t
```

### Resources
Here we are using GraphQL-yoga server from The Guild.  The Guild also developed GraphQL Envelop which can be used to [secure the GraphQL API](https://the-guild.dev/graphql/envelop/docs/guides/securing-your-graphql-api) in the docs. 
