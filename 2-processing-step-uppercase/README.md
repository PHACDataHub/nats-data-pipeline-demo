# 2 Processing Step Uppercasing

This is an oversimplified example of the NATS messaging system.

This service will do some processing - in this case its some uppercasing.

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
<!-- 
```
npm t
``` -->
Tests to come shortly.

## Code audits

The most useful resource for reviewing this code is Google's [nodesecroadmap](https://github.com/google/node-sec-roadmap).