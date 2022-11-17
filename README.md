# nats-data-pipeline-demo

This project explores the use of [NATS](https://nats.io/) to process and store data.  

*Please note this is a work in progress*

Each service subscribes and listens to a NATS subject (like a channel), performs a function, then publishes to a different NATS subject that is listened to by a subsequent service. 

The [safe-inputs](https://github.com/PHACDataHub/safe-inputs) project is used as a data source in the demo. To initiate the flow and data published as a JSON, 'upload' a spreadsheet on https://safeinputs.alpha.canada.ca/pagesix.

This repo uses the [node-microservices-demo](https://github.com/PHACDataHub/node-microservices-demo) framework.
