# 2 Transformation Step - Uppercasing

This is an simplified example of the NATS messaging system.

This service looks a lot like [1-transformation-step-extract-subset-of-data](../1-transformation-step-extract-subset-of-data/), because it is.  The pipeline is composed of microservices that communicate through the NATS messaging system. Each transformation service goes through the same steps; connecting to the NATS server, setting up the pub/sub streams and jetstream consumers, performing a simple transformation, then publishing the transformed payload.  

The transfomation in this case is uppercasing the spreadsheet data - again, just to show that we can do transformations in a real-time data pipeline.

This service subcribes to the subject being published by [1-transformation-step-extract-subset-of-data](../1-transformation-step-extract-subset-of-data/) (safeInputsExtractedSubset.\<filename\>) and publishes to safeInputsUppercased.\<filename\>.

## Installing dependencies

```
npm install
```
## Running it
Note: If connecting to [ngs](https://synadia.com/ngs), an authorized user's NATS_JWT value stored in a `.env` file is required. (This is not the case at the moment - we're using the nats demo servers for now.)
```
$ npm start 
```

## Tests to come

## Code audits

The most useful resource for reviewing this code is Google's [nodesecroadmap](https://github.com/google/node-sec-roadmap).
