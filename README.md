# nats-data-pipeline-demo

This project explores the use of [NATS](https://nats.io/) to process and store data.  

*Please note this is a work in progress*

Each service subscribes and listens to a NATS subject (like a channel), performs a function, then publishes to a different NATS subject that is listened to by a subsequent service. 

The [safe-inputs](https://github.com/PHACDataHub/safe-inputs) project is used as a data source in this demo. To initiate the flow, and have JSON data published, 'upload' a spreadsheet here: https://safeinputs.alpha.canada.ca/pagesix. (But the services will pick up anything published on the subject channels they are subscribed to.)

Hoping to explore the [NATS services API](https://www.youtube.com/watch?v=vUWw3HVY35E) an the potential to use NATS key-value and object store to act as a database. 

This repo (will) use the [node-microservices-demo](https://github.com/PHACDataHub/node-microservices-demo) framework.
