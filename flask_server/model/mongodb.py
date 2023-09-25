import pymongo
from pymongo import MongoClient

#MONGO_HOST = "13.235.225.168" #RELEASE SERVER
MONGO_HOST = "15.165.137.38" #DEV SERVER
MONGO_CONN = pymongo.MongoClient("mongodb://root:1234@%s" % (MONGO_HOST))  # localhost로 연결설정

# Mongodb 연결확인 함수
def conn_mongodb():
    try:
        MONGO_CONN.admin.command("ismaster")
        cla_db = MONGO_CONN.cla_db
    except:
        MONGO_CONN = pymongo.MongoClient("mongodb://root:1234@%s" % (MONGO_HOST))
        cla_db = MONGO_CONN.cla_db
    return cla_db
