
import asyncio
import contextlib
import nats
import json
#  (reference https://github.com/codenotary/immudb-client-examples/blob/master/python/hello_world.py)

# Immudb(immutable database) - note have docker container up and running 
# also need NGS.creds file at root of this folder
from immudb import ImmudbClient

client = ImmudbClient("0.0.0.0:3322")
client.login(username="immudb", password="immudb")

async def message_handler(msg):
    subject = msg.subject
    # reply = msg.reply
    data = msg.data.decode()
    print("Received a message on '{subject}': {data}".format(
        subject=subject, data=data))

async def run(loop):
    nc = await nats.connect("tls://connect.ngs.global:4222", user_credentials="NGS.creds")
    print('🚀 Connected to NATS server...')

    subject = "extractedSheetData"
    sub = await nc.subscribe(subject)
    print("Listening for requests on", subject,"subject...")

    while True:
        await asyncio.sleep(1)
        with contextlib.suppress(Exception):
            # data = msg.data.decode()
            # print(data)
            async for msg in sub.messages:

                #TODO change to this https://nats-io.github.io/nats.py/modules.html#connection-properties
                print(f"Received a message on '{msg.subject}': {msg.data.decode()}")

                # insert in db
                data_to_insert = json.dumps(msg.data.decode())
                key = subject.encode('utf8')
                value = data_to_insert.encode('utf8')

                # set a key/value pair
                client.set(key, value)

                # reads back the value
                readback = client.get(key)
                saved_value = readback.value.decode('utf8')
                print('--------------------------------')
                print("Saved to db: \n", saved_value)

    # Terminate connection to NATS.
    await nc.drain()

if __name__ == '__main__':
    # asyncio.run(main())
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run(loop))
    loop.run_forever()
    loop.close()