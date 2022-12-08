
import asyncio
import contextlib
import nats
import json
import ast
import time
from nats.errors import TimeoutError
from immudb import ImmudbClient
#  (references https://github.com/codenotary/immudb-client-examples/blob/master/python/hello_world.py)
#  And https://github.com/nats-io/nats.py/blob/main/examples/jetstream.py


async def main():
    # Immudb connection ((immutable database) - note have docker container up and running )
    client = ImmudbClient("0.0.0.0:3322")
    client.login(username="immudb", password="immudb")

    # NATS connection
    # nc = await nats.connect("tls://connect.ngs.global:4222", user_credentials="NGS.creds") # (need NGS.creds file at root of this folder if using this)
    nc = await nats.connect("demo.nats.io:4222")
    print('🚀 Connected to NATS server...')

    # Create JetStream context.
    js = nc.jetstream()
    stream = "safeInputsDataPipeline7"
    subject = "safeInputsDataPipeline7.uppercased.>"
    await js.add_stream(name=stream, subjects=["safeInputsDataPipeline7.>"])

    # Createpush durable consumer
    sub = await js.subscribe(subject, durable="uppercasingConsumerForImmudb")

    while True:
        await asyncio.sleep(1)
        with contextlib.suppress(Exception):

            async for msg in sub.messages:
                
                await msg.ack()
 
                print('\n--------------------------------------------')
                print(f'Received a message on "{subject}"')
                print(f"Adding {msg.subject} to database.\n")

                print("Timestamp:", round(time.time()*1000),'\n')

                
                # payload comes back as a str - and json.loads and ast aren't behaving as expected...
                # pull out everything between first : and first , **This is super janky way of doing this, and will need to come back to fix
                payload = msg.data.decode()
                start = ':"'
                end = '","me'
            
                filename = (payload.split(start))[1].split(end)[0]
                data_to_insert = msg.data.decode()

                key = filename.encode('utf8')
                value = data_to_insert.encode('utf8')

                # set a key/value pair
                client.set(key, value)

                # reads back the value
                readback = client.get(key)
                saved_value = readback.value.decode('utf8')
                # print('--------------------------------')
                print("Message saved to db: \nKey: ", key.decode('utf8'), "\nValue: ", saved_value)

    await nc.close()

if __name__ == '__main__':
    asyncio.run(main())
