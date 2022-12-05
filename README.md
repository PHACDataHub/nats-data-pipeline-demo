# NATS Data Pipeline Example

This project explores the use of [NATS](https://nats.io/) to process and store data.  

*Please note this is a work in progress*

Each service subscribes and listens to a NATS subject (like a channel), performs a function, then publishes to a different NATS subject - that is subscribed to by a subsequent service. 

The current flow is initiated from a spreadsheet being 'uploaded' here: https://safeinputs.alpha.canada.ca in the [safe inputs project](https://github.com/PHACDataHub/safe-inputs) -> via core nats -> extract-metadata-and-content (where the message is parsed - but really other work would be done here) -> via nats jetstream -> kv-store (in-stream key value store, in this case acting as a db) (AND) save-to-immudb (a versioning db).  api-kv-store is a GraphQL API used to add or retrieve data from kv-store. 

This isn't cloud ready (yet) so all modules of the pipeline should be running locally. Hoping to try out [Knative Functions](https://www.youtube.com/watch?v=VjI5WDOhAwk&t=5s) for this project... details to come. 

Also hoping to explore the [NATS services API](https://www.youtube.com/watch?v=vUWw3HVY35E).  And confirm and the capabilities of using NATS key-value and object store to act as a database. ([This video](https://www.youtube.com/watch?v=EJJ2SG-cKyM) provides a good jetstream overview and touches on key-value and object stores towards the end.)

It would also be great to show an alternative pipeline culminating with storage in alternative noSQL dbs (with GraphQL APIs). 

This repo (will) use the [node-microservices-demo](https://github.com/PHACDataHub/node-microservices-demo) framework.

 
