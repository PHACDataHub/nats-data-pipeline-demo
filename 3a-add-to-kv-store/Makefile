# Makefile

build:
	docker build -t kv-store . 

start:
	docker run --name kv-store kv-store

logs:
	docker logs -f kv-store

stop:
	docker stop kv-store &&\
		docker rm kv-store

run: 
	make build start

