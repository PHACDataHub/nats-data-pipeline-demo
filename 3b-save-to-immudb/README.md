# Insert into Database

This is an oversimplified example of the NATS messaging system.

This service subscribes to the "safeInputsDataPipeline5.uppercased.>" NATS subject (published by [2-processing-step-uppercase](../2-processing-step-uppercase)) and adds this payload into an [immudb](https://immudb.io/) database.  Immudb was chosen as the ability to reproduce reports and datasets amidst a slew of on going schema changes was a requirement mentioned for some surveillance teams.  As the immudb node SDK had some issues, this module uses python.  

* Need to add jetstream consumer - hoping to complete this today (Dec 7)


## Installing dependencies

```
make install
```
(Note - you will need a an authorized user's credentials file in NGS.creds if running locally)

## Running it

Run the immudb docker container 
```
docker build -t myown/immudb:latest -f Dockerfile .
docker build -t myown/immuadmin:latest -f Dockerfile.immuadmin .
```
```
$ python main.py
```

## Running the tests (to come)

```

```

## Code audits

The most useful resource for reviewing this code is Google's [nodesecroadmap](https://github.com/google/node-sec-roadmap).
