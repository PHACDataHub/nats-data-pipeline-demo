# Dockerfile
FROM python:3.7-alpine

# set the working directory in the container to /3b-save-to-immudb
WORKDIR /3b-save-to-immudb
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . .
CMD ["python","-u", "main.py"] 
# -u is for unbuffered so prints out