# extract-metadata-content

This is an oversimplified example of the NATS messaging system.

This reads subscribes to the extractedSheetData NATS subject and will dump into a noSQL database. 

* Note this doesn't do anything except pick up and print out the data (YET!) 

## Installing dependencies

```
npm install
```
(Note - you will need a an authorized user's NATS_JWT value stored .env if running locally)
## Running it

Note: the system expects a `.env` file in the root of the `json-to-db` floder containing the NATS_JWT value.
```
$ npm start &
```

## Running the tests

```
npm t
```

## Code audits

The most useful resource for reviewing this code is Google's [nodesecroadmap](https://github.com/google/node-sec-roadmap).
