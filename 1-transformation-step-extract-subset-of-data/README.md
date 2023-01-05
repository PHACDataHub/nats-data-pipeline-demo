# 1 Transformation Step - Extract Subset of Data

This is an oversimplified example of the NATS messaging system to show that we can do some transformation in a real-time data pipeline.

This service extracts a subset of the NATS payload sent from safe inputs. 

At this point, the data extracted from the xlsx from [safe inputs](https://safeinputs.alpha.canada.ca/) has been passed though the [GraphQL API]() and published via NATS message (along with additional information around the excel sheet settings ie hyperlinks intact etc...).  This service subscribes to that published NATS message and extracts out only the spreadsheet data and relevant metadata then publishes this data to another NATS subject.

While we are extracting a subset of information as an example, this could be data checking for pregnant males or field name validation before loading into a database; having options to transform the feildnames with predefined rules, or fire a alternate NATS messaage to activate an email alerting someone to check the dataset.

## Installing dependencies

```
npm install
```
(Note - you will need a an authorized user's NATS_JWT value stored .env if running locally)
## Running it

Note: the system expects a `.env` file in the root of the `json-to-db` floder containing the NATS_JWT value.
```
$ npm start 
```

## Tests to come

## Code audits

The most useful resource for reviewing this code is Google's [nodesecroadmap](https://github.com/google/node-sec-roadmap).
