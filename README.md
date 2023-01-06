# NATS Data Pipeline Demo

This project explores the use of [NATS](https://nats.io/) the for the messaging in a real-time data pipeline, as well as to store data.  

NATS is an open-source, cloud-native messaging system by [Synadia](https://synadia.com/). It simplifies the way services can communicate.  With the use of subject-based addressing (tokens separated by '.' with wildcards '*' and '>'), and connection to NATS servers, it allows for easy multi-cloud and multi-geo solutions. In an example case of collecting data various provinces and territories, each using different platforms - as long as they can connect to the NATS server with the authentication and authorization to publish on a particular stream, there's no issue.  This also allows for easy configuration of fan-in, fan-out and many-to-many communication patterns. From a technical standpoint, hospital data could be published directly local health units, PTs and PHAC simutaniously. 

Here's a [video](https://www.youtube.com/watch?v=hjXIUPZ7ArM&t=1s) providing an overview of NATS. More can be found on the [youtube channel](https://www.youtube.com/@SynadiaCommunications) and in the [docs](https://docs.nats.io/) and [repo](https://github.com/nats-io/).)

Note that there are two types of NATS messaging - core NATS (at-most-once delivery or send-and-forget) and [jetstream](https://www.youtube.com/watch?v=EJJ2SG-cKyM) (at-least-once message delivery).  Here we are using NATS jetstream, which stores messages on the NATS server (we can set the retention policy around this), allowing for consumers to have insight into the stream history or which messages they have consumed, or ensuring that messages are delivered in order, even with lost connection.

This pipeline is event driven. Each service subscribes and listens to a NATS subject (like a channel), performs a function, then publishes to a different NATS subject (that is then subscribed to by one or more services subsequent services), culminating in storage in a database and datastore. The communication is always between a service and the NATS server.

*Please note this is a work in progress*

The current flow is initiated with the 
* "upload" of a spreadsheet to https://safeinputs.alpha.canada.ca (the [safe inputs project](https://github.com/PHACDataHub/safe-inputs)) 
  * -> (pub) *nats jetstream message on subject "safeInputsRawSheetDAta"*  
* -> 1-transformation-step-extract-subset-of-data (where the message is parsed - but really other work would be done here too - this is an simplified example) 
  * -> (pub)*nats jetstream message on subject "safeInputsExtractedSubset.{filename}"* -> 
* -> 2-transformation-step-uppercase (where the data is uppercased)  
  * -> (pub) *nats jetstream message on subject "safeInputsUppercased.{filename}"* ->
* -> 3a-add-to-kv-store (puts message into the key value store, in this case using it as a db) 
* -> 3b-save-to-immudb (a versioning db).  

api-kv-store is a GraphQL API used to add or retrieve data from the NATS KV Store defined in 3a-add-to-kv-store. 

## Try it out!
Open up and start each service locally in Terminals or PowerShells and watch the data flow when you "upload" a file to safe inputs. 

Use the Yoga-GraphiQL interface to access the KV Store data and add additional data to the store. 
Running 3a-add-to-kv-store.kv_reader.js runs watch commands and will explore history (update to come on history).


### TODO
* With this hoping to explore the [NATS services API](https://www.youtube.com/watch?v=vUWw3HVY35E).
* Fix History in KV Store
* Use Object Store 
* Add in tests

This repo (will) use the [node-microservices-demo](https://github.com/PHACDataHub/node-microservices-demo) framework.


#### More Links: 
https://docs.nats.io/nats-concepts/jetstream
https://nats.io/blog/nats-server-29-release/
