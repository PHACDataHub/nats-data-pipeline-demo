# API for NATS KV (Key Value) Store

This is an API used to interact with the KV Store.  Any files input through the [Safe Inputs](https://safeinputs.alpha.canada.ca/) UI while this pipeline is running should stored in the KV Store and can be accessed the API. There's also an option to add new file data to  

#### TODO
* There is an issue with the getFile schema (limiting query options - would like it to be of type "File").
* Need to expand to include retrieval of historic values (right now it's still only the last value).
* Leverage Graphql-yoga 3's file loading capability to upload into the stream through this API.

## Installing dependencies
```
npm install
```

## Running it
```
$ npm start 
```
Open Graphical interface (http://localhost:3000/) interact with the store.

#### Add to the stream
```
mutation {
    addFileToKVStore (
      filename:"More_file_data.xlsx",
      filedata: {a:3}
    )
  }
```
Note - until the history is fixed in the kv-store module, if you add new data through this mutation with the same filename as an exisiting file in the store, the old file will be overwritten. 

#### Retrieve file
```
{getFile(filename:"test.xlsx")}
```

## Running the tests

```
npm t
```

### Resources
Here we are using GraphQL-yoga server from The Guild.  The Guild also developed GraphQL Envelop which can be used to [secure the GraphQL API](https://the-guild.dev/graphql/envelop/docs/guides/securing-your-graphql-api) in the docs. 
