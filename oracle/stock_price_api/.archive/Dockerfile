# [START cloudrun_stockpriceapi_dockerfile]
# [START run_stockpriceapi_dockerfile]

# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.9-slim

ENV PYTHONUNBUFFERED True

ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

RUN pip install --no-cache-dir -r requirements.txt
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app

# [END run_stockpriceapi_dockerfile]
# [END cloudrun_stockpriceapi_dockerfile]