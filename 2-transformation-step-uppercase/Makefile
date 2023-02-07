# Makefile

build:
	docker build -t uppercase . 

start:
	docker run --name uppercase uppercase

logs:
	docker logs -f uppercase

stop:
	docker stop uppercase &&\
		docker rm uppercase

run: 
	make build start

