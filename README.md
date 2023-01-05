# NATS Data Pipeline Demo

This project explores the use of [NATS](https://nats.io/) to pipeline and store data.  

NATS is an open-source, cloud-native messaging system by [Synadia](https://synadia.com/). It simplifies the way services can communicate; easily spanning multi-cloud and multi-geo systems.  It allows for a variety of communication patterns that can be configured to meet the needs of many use cases.

[Here's](https://www.youtube.com/watch?v=hjXIUPZ7ArM&t=1s) a video giving a NATS overview. More information can be found in the [docs](https://docs.nats.io/), [repo](https://github.com/nats-io/) and [nats by example](https://natsbyexample.com/) site.

*Please note this is a work in progress*

Each service subscribes and listens to a NATS subject (like a channel), performs a function, then publishes to a different NATS subject (that is then subscribed to by a subsequent service). 

The current flow is initiated with the 
* "upload" of a spreadsheet to https://safeinputs.alpha.canada.ca (the [safe inputs project](https://github.com/PHACDataHub/safe-inputs)) -> (pub)
  * *core nats message on subject "sheetData" (will change to jetstream shortly)* 
* (sub) -> 1-transformation-step-extract-subset-of-data (where the message is parsed - but really other work would be done here too - this is an oversimplified example) -> (pub)
  * *nats jetstream message on subject "safeInputsExtractedSubset.{filename}"* -> 
* (sub) -> 2-transformation-step-uppercase (where the data is uppercased) -> (pub) 
  * *nats jetstream message on subject "safeInputsUppercased.{filename}"* -> 
* (sub) ->3a-add-to-kv-store (puts message into the key value store, in this case using it as a db) 
* *AND* (sub) ->3b-save-to-immudb (a versioning db).  

api-kv-store is a GraphQL API used to add or retrieve data from the NATS KV Store defined in 3a-add-to-kv-store. 

Open up and start each service in the command-line of your choice and watch the data flow when you "upload" a file to safe inputs. 

Use the Yoga-GraphiQL interface to access the KV Store data and add additional data to the store. 
Running 3a-add-to-kv-store.kv_reader.js runs watch commands and will explore history (update to come on history).

Note that this isn't cloud ready (yet) so you can run all modules of the pipeline locally for now. 

With this hoping to explore the [NATS services API](https://www.youtube.com/watch?v=vUWw3HVY35E).  And confirm and the capabilities of using NATS key-value and object store to act as a database. ([This video](https://www.youtube.com/watch?v=EJJ2SG-cKyM) provides a good jetstream overview and touches on key-value and object stores towards the end.) 

This repo (will) use the [node-microservices-demo](https://github.com/PHACDataHub/node-microservices-demo) framework.

 
