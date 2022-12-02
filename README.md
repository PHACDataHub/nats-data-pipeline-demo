# NATS Data Pipeline Demo

This project explores the use of [NATS](https://nats.io/) to process and store data.  

*Please note this is a work in progress*

Each service subscribes and listens to a NATS subject (like a channel), performs a function, then publishes to a different NATS subject - that is subscribed to by a subsequent service. 

The [safe-inputs](https://github.com/PHACDataHub/safe-inputs) project is used as a data source in this demo. To initiate the flow, 'upload' a spreadsheet here: https://safeinputs.alpha.canada.ca. (But the services will pick up anything published on the subject channels they are subscribed to.)  This isn't cloud ready so all modules of the pipeline should be running locally.

Hoping to explore the [NATS services API](https://www.youtube.com/watch?v=vUWw3HVY35E) and the potential to use NATS key-value and object store to act as a database. ([This video](https://www.youtube.com/watch?v=EJJ2SG-cKyM) provides a good jetstream overview and touches on key-value and object stores towards the end.)

It would also be great to show an alternative pipeline culminating with storage in a noSQL db, exposed with a graphQL API. 

This repo (will) use the [node-microservices-demo](https://github.com/PHACDataHub/node-microservices-demo) framework.

It will also be great to try out [Knative Functions](https://www.youtube.com/watch?v=VjI5WDOhAwk&t=5s) for this project... details to come.  
