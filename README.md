# NATS Data Pipeline Demo

This project explores the use of [NATS](https://nats.io/) for the messaging system, as well as to store data, in a real-time data pipeline.

NATS is an open-source, cloud-native messaging system by [Synadia](https://synadia.com/). It simplifies the way services can communicate and allows for easy multi-cloud and multi-geo solutions - avoiding vendor lock-in as well as allowing for messaging between the provinces and territories, health units, PHAC and other health organizations, regardless of where they are located and what platform they are using.

Here's a [video](https://www.youtube.com/watch?v=hjXIUPZ7ArM&t=1s) providing an overview of NATS. More can be found on the [youtube channel](https://www.youtube.com/@SynadiaCommunications) and in the [docs](https://docs.nats.io/) and [repo](https://github.com/nats-io/).

There are two types of NATS messaging - core NATS (at-most-once delivery or send-and-forget) and [jetstream](https://www.youtube.com/watch?v=EJJ2SG-cKyM) (at-least-once message delivery).  Here we're using NATS jetstream, which stores messages on the NATS server (we can set the retention policy around this), allowing for consumers to have insight into the message stream history, and to know which messages they have consumed; ensuring that messages are delivered in order, even with a lost connection.

This pipeline is event driven. Each service subscribes and listens to a NATS subject (like a channel), performs a function, then publishes to a different NATS subject (that is then subscribed to by one or more services subsequent services), culminating in storage in a database and datastore. 


*Please note this is a work in progress*

The current flow is initiated with the 
* "upload" of a spreadsheet to https://safeinputs.alpha.canada.ca (the [safe inputs project](https://github.com/PHACDataHub/safe-inputs)) 
  * -> *nats jetstream message on subject "safeInputsRawSheetData"* ->  
* 1-transformation-step-extract-subset-of-data (where the message is parsed - but really other work would be done here too - this is an simplified example) 
  * -> *nats jetstream message on subject "safeInputsExtractedSubset.{filename}"* -> 
* 2-transformation-step-uppercase (where the data is uppercased)  
  * -> *nats jetstream message on subject "safeInputsUppercased.{filename}"* ->
* 3a-add-to-kv-store (puts message into the NATS key value store, in this case using it as a filestore/ database) 
* 3b-save-to-immudb (a versioning db).  

api-kv-store is a GraphQL API built as an alternative way to add or retrieve data from the NATS KV Store defined in 3a-add-to-kv-store. 

## Try it out!
Open up and start each service locally in your command lines of choice and watch the data flow when you "upload" a file to safe inputs. 

Use the Yoga-GraphiQL interface to access the KV Store data and add additional data to the store. 
Running 3a-add-to-kv-store.kv_reader.js runs watch commands and will explore history (update to come on history).


### TODO
* With this hoping to explore the [NATS services API](https://www.youtube.com/watch?v=vUWw3HVY35E).
* Fix History in KV Store
* Use Object Store 
* Add in tests
* More python (right now only 3b-save-to-immudb is in python, but jetstream setup seems cleaner)

This repo (will) use the [node-microservices-demo](https://github.com/PHACDataHub/node-microservices-demo) framework.


#### More Links: 
https://docs.nats.io/nats-concepts/jetstream
https://nats.io/blog/nats-server-29-release/
