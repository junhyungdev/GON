from model.mongodb import conn_mongodb
from flask import Flask, request, jsonify, Blueprint
from ast import literal_eval
from datetime import datetime, timedelta, date
import pymongo
from pymongo import MongoClient
from bson import ObjectId
from bson.json_util import dumps
import json

board = Blueprint("board", __name__)


class Board:
    def __init__(self, _id, title, publish_date, course_id):
        self._id = _id
        self.title = title
        self.publish_date = publish_date
        self.course_id = course_id


mongo_db = conn_mongodb()

"""
# MongoDB 연결 설정
# MONGO_URI = "mongodb://<username>:<password>@<host>:<port>/<database>"
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client["local"]
articles = db["articles"]
"""
# literal_eval - 문자열로 표현된 파이썬 데이터 구조를 원래의 데이터 구조로 변환할 때 사용됩니다. 예를 들어, "[1, 2, 3]"와 같은 문자열을 리스트 [1, 2, 3]으로 변환하거나, "{'a': 1, 'b': 2}"와 같은 문자열을 딕셔너리 {'a': 1, 'b': 2}로 변환할 때 사용할 수 있습니다.


# [CREATE] 게시글 생성
@board.route("/create", methods=["POST"])
# @jwt_required()
def create_article():
    body = literal_eval(request.get_json()["body"])
    user_id = body["user_id"]
    title = body["title"]
    content = body["content"]
    full_name = body["full_name"]
    attachmentUrl = body["attachmentUrl"]
    publish_date = datetime.now()
    # postingid = str(user_id) + ";" + str(publish_date)

    # 게시글 번호 찾기
    current_count = mongo_db.board_collection.count_documents({})
    new_no = current_count + 1

    print(content, publish_date, type(user_id))
    article = {
        "posting_id": new_no,
        # "posting_id": postingid,
        "user_id": user_id,
        "title": title,
        "content": content,
        "full_name": full_name,
        "attachmentUrl": attachmentUrl,
        "publish_date": publish_date,
        "likepeople": [],
        "commentCount": 0,
    }

    result = mongo_db.board_collection.insert_one(article)  # mongodb insert
    print("create_ok")
    return jsonify({"msg": "글생성 성공", "status": 200})


# Custom function to convert date and datetime objects
def date_converter(o):
    if isinstance(o, (date, datetime)):
        return o.isoformat()
    elif isinstance(o, ObjectId):
        return str(o)
    raise TypeError("Object of type '%s' is not JSON serializable" % type(o).__name__)


# [READ] 게시글 목록 조회
@board.route("/", methods=["GET"])
# @jwt_required()
def read_article_list():
    if request.method == "GET":
        print("read_start")

        # Find and sort documents in the 'board_collection'
        result = mongo_db.board_collection.find().sort("publish_date", -1)

        # Serialize the result with BSON to JSON string
        serialized_data = dumps(result, default=date_converter)

        # Load the JSON string back as a Python data structure
        json_data = json.loads(serialized_data)

        # Prepare the final list by transforming the ObjectId into a string and adding title, full_name, and publish_date
        lst = []
        for m in json_data:
            m["_id"] = str(m["_id"])
            m["title"] = m.get("title", "")
            m["full_name"] = m.get("full_name", "")
            m["publish_date"] = m.get("publish_date", "")
            lst.append(m)
        print("check")
        return jsonify({"msg": "게시글 조회 성공", "status": 200, "list": lst})


# [READ] 게시글 내용 읽기
@board.route("/<int:idx>", methods=["GET"])
# @jwt_required()
def read_article(idx):
    if request.method == "GET":
        print("read_start")
        lst = []
        date_now = datetime.now()

        for m in mongo_db.board_collection.find({"posting_id": idx}):
            # Count comments using count_documents()
            commentCount = mongo_db.comment_collection.count_documents(
                {"posting_id": m["posting_id"]}
            )

            # Assuming m["publish_date"] is already a datetime object
            publish_date = m["publish_date"]
            time_diff = date_now - publish_date

            if time_diff.seconds < 60:
                createdate = "Now"
            elif time_diff.seconds < 3600:
                createdate = f"{time_diff.seconds // 60} minutes ago"
            elif time_diff.days == 0:
                createdate = f"{time_diff.seconds // 3600} hours ago"
            else:
                createdate = publish_date.strftime("%Y/%m/%d %H:%M:%S")

            article = {
                "posting_id": m["posting_id"],
                "user_id": m["user_id"],
                "full_name": m["full_name"],
                "attachmentUrl": m["attachmentUrl"],
                "title": m["title"],
                "content": m["content"],
                "publish_date": m["publish_date"],
                "likepeople": m["likepeople"],
                "likepeoplelength": len(m["likepeople"]),
                "commentCount": commentCount,
                "createdate": createdate,
            }
            lst.append(article)

        print("read.ok")
        return jsonify(lst)


# [UPDATE] 게시글 수정
@board.route("/<int:idx>/update", methods=["POST"])
# @jwt_required()
def modify_article(idx):
    body = literal_eval(request.get_json()["body"])
    print(body)
    title = body["edittitle"]
    content = body["editContent"]
    date = datetime.now()

    mongo_db.board_collection.update_one(
        {"posting_id": idx},
        {"$set": {"title": title, "content": content, "publish_date": date}},
    )
    print("update_ok")
    return jsonify({"msg": "수정완료 성공", "status": 200})


# [DELETE] 게시글 삭제
@board.route("/<int:idx>/delete", methods=["DELETE"])
# @jwt_required()
def delete_articles(idx):
    # 게시글 조회
    article = mongo_db.board_collection.find_one({"posting_id": idx})

    if article:
        # 게시글 삭제
        mongo_db.board_collection.delete_one({"posting_id": idx})
        # 댓글 삭제
        mongo_db.comment_collection.delete_many({"posting_id": idx})

        # 게시글 번호 재할당 로직
        mongo_db.board_collection.update_many(
            {"posting_id": {"$gt": idx}}, {"$inc": {"posting_id": -1}}
        )

        return jsonify({"msg": "삭제성공", "status": 200})
    else:
        return jsonify({"msg": "게시글을 찾을 수 없습니다.", "status": 400})


# [CLICK] 게시글 좋아요
@board.route("/<int:idx>/like/click", methods=["POST"])
# @jwt_required()
def click_like(idx):
    body = literal_eval(request.get_json()["body"])
    userid = body["likeuser"]

    mongo_db.board_collection.update_one(
        {"posting_id": idx}, {"$push": {"likepeople": userid}}
    )

    return jsonify({"msg": "좋아요 성공", "status": 200})


# [CANCEL] 게시글 좋아요 취소
@board.route("/<int:idx>/like/cancel", methods=["POST"])
# @jwt_required()
def click_like_cancel(idx):
    body = literal_eval(request.get_json()["body"])
    userid = body["likeuser"]

    mongo_db.board_collection.update_one(
        {"posting_id": idx}, {"$pull": {"likepeople": userid}}
    )

    return jsonify({"msg": "좋아요 취소 성공", "status": 200})
