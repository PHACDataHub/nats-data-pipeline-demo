# 1 Transformation Step - Extract Subset of Data

This is an simplified example of the NATS messaging system to show that we can do some transformations in this real-time data pipeline.

While the function we are performing in this example is extracting a subset of the NATS payload sent from [Safe Inputs](https://safeinputs.alpha.canada.ca/)(the message contains the spreadsheet data along with superfluous information around the excel sheet settings ie hyperlinks intact etc...), this service could be performing any transformation funtion. For example, it could be data checking for 'pregnant males', performing field name validation before loading into a database; possibly using predefined rules to transform specific feildnames, or sending a NATS message to an email service indicating that this dataset needs to be manually validated. 

The NATS subject that this service subscribes to ('safeInputsRawSheetData') orginiates from the [Safe Inputs API](https://github.com/PHACDataHub/safe-inputs/tree/main/api).  We are using NATS [jetstream](https://docs.nats.io/nats-concepts/jetstream) here which ensures at-least-once delivery of the messages by storing these messages on the NATS server (we can specify retention policy around this) and by using message acknowledgment.  That means if the service goes down, the system knows which messages it has recieved and once the service is back up, it will recieve any messages that have been missed. (This is how it's set up now with a *durable consumer*, but we could in an different use case use an *euphermal consumer* which would recieve all historic messages once spun up.) While we are subscibing to only one subject in this case, the jetstream consumer can subscribe to multiple sources or subjects at once. 

At the completion of the transformation, another NATS message containing the updated payload is published using a different subject ('safeInputsExtractedSubset.<filename>').  Any service that wishes to subscribe to this subject can do so as long as it has valid authentication and authorization to do so.  In this case we are using the NATS demo server so there is no issue accessing it, but if we are using Synadia's NGS or setting up our own NATS cluster, credentials would come into play. 

## Installing dependencies

```
npm install
```

## Running it
Note: the system expects an authorized user's NATS_JWT value stored in a `.env` file, located at the root, when connecting to the NGS servers (This is currently not the case - we are using the nats demo servers at the moment.)
```
$ npm start 
```

## Tests to come

## Code audits

The most useful resource for reviewing this code is Google's [nodesecroadmap](https://github.com/google/node-sec-roadmap).
