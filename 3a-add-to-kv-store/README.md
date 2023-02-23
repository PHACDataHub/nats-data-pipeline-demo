# Key Value and Object Storage

The idea here is to use NATS KV (Key-Value) and Object Store as a filestore or database; using the filename from the spreadsheet "uploaded" in safe-inputs as the key and the extracted, and now transformed data as the value.  Jetstream is NATS' at-least-once message delivery system and it can do this by storing the messages on the NATS server (given a particular retention policy) and using message acknowledgement. Both KV and Object Store are materialized views on jetstream.  

Object Store is essentially KV Store but for larger files (there are size limitations in the 1-84 mb range for the NATS messages) - this can be used to store large files such as vidos. Object Store works by chunking larger files into smaller pieces and adding them to the stream/ store in order. When a particular file is called back it can be re-pieced together in the correct order. *Note: Object store exploration to come - this service just looks at KV Store for now*

This service subscribes to messages published from [2-transformation-step-uppercase](../2-transformation-step-uppercase/) on the safeInputsUppercased.\<filename\> subject and then 'puts' them into a KV Store.  Note - the [current max history per key is 64](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-8.md). 

Files data can be retrieved from the KV Store through an alternate API [api-kv-store](../api-kv-store), (KV store is an API to access jetstream) or an SDK like seen in [kv_reader.js](kv_reader.js)

### Notes
*The KV Store history is not yet working in this code - the default history is 1 (or no historic values stored), and it seems to still be using this default. (but note - max per subject is 64)*

*Still need to further investigate limits - here we're using Synadia's demo server, and previously the free ngs account which has some limitations in terms mandatory jetsream retention policies and storage limits. (update - looks like when running your own cluster or leaf node you can set unlimited for jetstream retention (size, age, count)* 

*KV store requires the key to be void of whitespaces (Rules are; must only contain A-Z, a-z, 0-9, `-`, `_`, `/`, `=` or `.` and cannot start with `.`), so if the file name contains spaces or brackets this module replaces them with '_' prior to being put into the KV store.*

## NATS Jetstream, KV and Object Store Resources



#### CODE EXAMPLES:
Key Value Store: https://github.com/nats-io/nats.docs/tree/master/nats-concepts/jetstream/key-value-store  
*(One thing about KV that I'm seeing is that you need set a discard policy - at least for the ngs/ Synadia demo NATS servers - when stream gets to a particular size (not great for storage). Note - Value size is maxed out at 84 mb, but our current jetstream size is 1 mb (this could also be a ngs/ Synadia demo NATS servers limitation).* 

Object Store:
https://github.com/nats-io/nats.docs/blob/master/nats-concepts/jetstream/object-store/obj_walkthrough.md   
*(It appears we may need a file path to point to when using the cli as well as with the deno code (haven't gotten it to work yet - (so have the JSON downloaded or stored somewhere).  The GO library seem much more usable for our purposes.* 

Nats By Example: 
https://natsbyexample.com/  This is a great resource in general, but limited in number langauges they maintain for some features.

# Running the Code
## Run with Docker 
```
$ npm run service
```
### Stop Container 
```
$ npm stop
```
## Without Docker
### Installing dependencies

```bash
$ npm install
```
### Running it
Note: If connecting to [ngs](https://synadia.com/ngs), an authorized user's NATS_JWT value stored in a `.env` file is required. (This is not the case at the moment - we're using the nats demo servers for now.)
```
$ npm start 
```
## Reading from the KV Store:

```bash
$ node kv_reader.js
```
(or use api)
* Tests to come shortly
