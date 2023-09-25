FROM python:3.10-alpine
WORKDIR /docker-flask-test
COPY . /docker-flask-test
RUN pip install -r requirements.txt
RUN pip install flask
RUN pip install gunicorn
CMD ["python", "app.py"]
