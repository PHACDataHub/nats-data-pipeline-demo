# Makefile

build:
	docker build -t transform1 . 

start:
	docker run --name transform1 transform1

logs:
	docker logs -f transform1

stop:
	docker stop transform1 &&\
		docker rm transform1

make build start

