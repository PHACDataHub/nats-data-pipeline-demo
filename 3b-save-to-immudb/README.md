# Insert into Database

This is an simplified example of the NATS messaging system.

This service subscribes to the "safeInputsDataPipeline5.uppercased.>" NATS subject (published by [2-transformation-step-uppercase](../2-processing-step-uppercase)) and adds these message payloads into an [immudb](https://immudb.io/) database.  Immudb was chosen as the ability to reproduce reports and datasets amidst a slew of on going schema changes was a requirement mentioned for some surveillance teams.  As the immudb node SDK had some issues, this module uses python.  

The console logs display the keys and values pulled from the database after they have been loaded.

## Installing dependencies

```
make install
```
(Note - if using ngs (this is not at this time) you will need a an authorized user's credentials file in NGS.creds if running locally)

## Running it

Run the immudb docker container 
```
docker run -ti -p 3322:3322 codenotary/immudb:latest
```
then,
```
$ python main.py
```

## Running the tests (to come)


## Code audits

The most useful resource for reviewing this code is Google's [nodesecroadmap](https://github.com/google/node-sec-roadmap).
