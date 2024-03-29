# Insert into Database

This is an simplified example of the NATS messaging system.

This service subscribes to the "safeInputsDataPipeline5.uppercased.>" NATS subject (published by [2-transformation-step-uppercase](../2-processing-step-uppercase)) and adds these message payloads into an [immudb](https://immudb.io/) database.  Immudb was chosen as the ability to reproduce reports and datasets amidst a slew of on going schema changes was a requirement mentioned for some surveillance teams.  As the immudb node SDK had some issues, this module uses python.  

The console logs display the keys and values pulled from the database after they have been loaded.

## Running
```
$ docker compose build
$ docker compose up
```
## When done
```
$ docker compose down
```

## Running the tests (to come)

## Code audits

The most useful resource for reviewing this code is Google's [nodesecroadmap](https://github.com/google/node-sec-roadmap).
