# extract-metadata-content

This is an oversimplified example of the NATS messaging system.

At this point, the data extracted from the xlsx has been passed though the [GraphQL API](../api/) and published via NATS message.  split-out-worksheets picks up this JSON data and splits out the worksheets then publishes them individually by name.

* Note this doesn't do anything except print out the data (YET!) 
* NOTE - this will need a refactor - just getting the ideas out.

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
