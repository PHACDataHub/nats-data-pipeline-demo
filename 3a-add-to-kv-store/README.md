# Key Value and Object Storage

The idea here is to use NATS KV (Key-Value) and Object Store a database; using the filename from safe-inputs as the key and the extracted data as the value.  Both KV and object store are materialized views into NATS message jetstream. Object Store is essentially KV Store but for larger files - by chunking the larger file into smaller, managable pieces and added to the stream/ store in order, so when it's called back it can be re-pieced together in the correct order.

There are two types of NATS messaging - core NATS (at-most-once delivery or send-and-forget) and jetstream (at-least-once message delivery).  Here we are using NATS jetstream and adding consumers that can replay the messages and have insight into the stream history. The advatage of core NATS is that it's fast - it just fires off a message doesn't wait for acknowledgment as with jetstream.  If the message subject is not subscribed to at the time it's fired, that message is gone. Jetstream has message memory ensuring that messages are delivered, even with lost connection, and in order.

** The kv store history isn't yet working in this code - the default history is 1 (or no historic values stored), and it seems to still be using this default.

There are a wide range of options available when setting up message consumers with jetstream.  Durable consumers know what they have consumed previously and euphemeral will have insight into the entire stream's history.

** Still need to further investigate limits - here we're using Synadia's demo server, and previously the free ngs account which has some limitations in terms mandatory jetsream retention policies and storage limits. 

(Note - KV store requires the key to be void of whitespaces (Rules are; must only contain A-Z, a-z, 0-9, `-`, `_`, `/`, `=` or `.` and cannot start with `.`), so if the file name contains spaces or brackets (will update with regex to include above rule shortly), this module replaces them with '_' prior to being put into the KV store).

## NATS Jetstream, KV and Object Store Resources
#### DOCS: 
https://docs.nats.io/nats-concepts/jetstream
https://nats.io/blog/nats-server-29-release/

#### VIDEOS: 
[Move over Kafka! Let's try NATS JetStream](https://www.youtube.com/watch?v=EJJ2SG-cKyM) has a great explaination for using jetstream as well as key-value (KV) and object storage concepts and applying them with the cli.

#### CODE EXAMPLES:
Key Value Store: https://github.com/nats-io/nats.docs/tree/master/nats-concepts/jetstream/key-value-store  
*(One thing about KV that I'm seeing is that you need set a discard policy - at least for the ngs/ Synadia demo NATS servers - when stream gets to a particular size (not great for storage). Note - Value size is maxed out at 84 mb, but our current jetstream size is 1 mb (this could also be a ngs/ Synadia demo NATS servers limitation).* 

Object Store:
https://github.com/nats-io/nats.docs/blob/master/nats-concepts/jetstream/object-store/obj_walkthrough.md   
*(It appears we may need a file path to point to when using the cli as well as with the deno code (haven't gotten it to work yet - (so have the JSON downloaded or stored somewhere).  The GO library seem much more usable for our purposes.* 

Nats By Example: 
https://natsbyexample.com/  This is a great resource in general, but limited in number langauges they maintain for some features.

# Running the Code

## Installing dependencies

```bash
$ npm install
```

## Writing to the KV Store:

```bash
$ npm start
```

## Reading from the KV Store:

```bash
$ node kv_reader.js
```
(or use api)
* Tests to come shortly
