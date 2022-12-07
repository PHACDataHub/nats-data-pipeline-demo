# NATS Data Pipeline Demo

This project explores the use of [NATS](https://nats.io/) to process and store data.  

*Please note this is a work in progress*

Each service subscribes and listens to a NATS subject (like a channel), performs a function, then publishes to a different NATS subject - that is subscribed to by a subsequent service. 

The current flow is initiated with the 
* "upload" of a spreadsheet to https://safeinputs.alpha.canada.ca (the [safe inputs project](https://github.com/PHACDataHub/safe-inputs)) -> (pub)
  * *core nats message on subject "sheetData" (will change to jetstream shortly)* 
* (sub) -> 1-processing-step-extract-subset-of-data (where the message is parsed - but really other work would be done here) -> (pub)
  * *nats jetstream message on subject "safeInputsDataPipeline5.extractedData.{filename}"* -> 
* (sub) -> 2-processing-step-uppercase (where the data is uppercased) -> (pub) 
  * *nats jetstream message on subject "safeInputsDataPipeline5.uppercased.{filename}"* -> 
* (sub) ->3a-add-to-kv-store (puts message into the key value store, in this case using it as a db) 
* (sub) ->3b-save-to-immudb (a versioning db).  

api-kv-store is a GraphQL API used to add or retrieve data from kv-store. 

Open up and start each service in a terminal/PowerShell and watch the data flow when you "upload" a file to safe inputs. 

Use the Yoga-GraphiQL interface to access the KV Store data and add additional data to the store. 
Running 3a-add-to-kv-store.kv_reader.js runs watch commands and will explore history (update to come on history).

Note that this isn't cloud ready (yet) so you can all modules of the pipeline locally for now. 

With this hoping to explore the [NATS services API](https://www.youtube.com/watch?v=vUWw3HVY35E).  And confirm and the capabilities of using NATS key-value and object store to act as a database. ([This video](https://www.youtube.com/watch?v=EJJ2SG-cKyM) provides a good jetstream overview and touches on key-value and object stores towards the end.) 

This repo (will) use the [node-microservices-demo](https://github.com/PHACDataHub/node-microservices-demo) framework.

 
