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