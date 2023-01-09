# 1 Transformation Step - Extract Subset of Data

This is an simplified example of the NATS messaging system to show that we can do some transformations in this real-time data pipeline.

While the function that's being performed in this example is extracting a subset of the NATS payload sent from [Safe Inputs](https://safeinputs.alpha.canada.ca/) (this payload contains the spreadsheet data along with superfluous information around the excel sheet settings ie hyperlinks intact etc...), this service could be performing any transformation function. For example, it could be data checking for 'pregnant males', performing field name validation before loading into a database; possibly using predefined rules to transform specific feildnames, or sending a NATS message to an email service in order to indicate that this data needs to be manually validated. 

The NATS subject that this service subscribes to (safeInputsRawSheetData) orginiates from the [Safe Inputs API](https://github.com/PHACDataHub/safe-inputs/tree/main/api).  We are using NATS [jetstream](https://docs.nats.io/nats-concepts/jetstream) here which ensures at-least-once delivery of the messages by storing these messages on the NATS server (we can specify retention policy around this) and by using message acknowledgment.  That means that the system knows which messages this service as recieved, and if the service goes down at any point, it will will recieve any messages that have been missed once it's up again. (This is how it's set up now with a *durable consumer*, but in an different use case we could use an *euphermal consumer* which would recieve all historic messages once spun up.) 

While we're subscibing to only one subject in this case, the jetstream consumer can subscribe to multiple sources or subjects at once. 

At transformation completion, another NATS message containing the updated payload is published using a different subject ('safeInputsExtractedSubset.\<filename\>').  Any service that wishes to subscribe to this subject can do so as long as it has valid authentication and authorization to do so.  In this case we are using the NATS demo server so there's no issue accessing it, but if we're using Synadia's NGS or setting up our own NATS cluster, credentials would come into play. 

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
