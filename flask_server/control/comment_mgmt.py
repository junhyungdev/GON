from model.mongodb import conn_mongodb
from flask import Flask, request, jsonify, Blueprint
from ast import literal_eval
from datetime import datetime, timedelta
import pymongo
from pymongo import MongoClient
from bson import ObjectId

# 블루프린트는 import해서 사용할 것 여러 곳에서 정의되면 문제가 생긴다.
from control.board_mgmt import board


comment = Blueprint("comment", __name__)
mongo_db = conn_mongodb()


# [CREATE] 댓글
@board.route("/<int:idx>/comment/create", methods=["POST"])
# @jwt_required()
def create_comment(idx):
    body = literal_eval(request.get_json()["body"])
    print(body)
    posting_id = idx
    user_id = body["user_id"]
    full_name = body["full_name"]
    content = body["content"]
    date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 댓글 번호 찾기
    current_count = mongo_db.comment_collection.count_documents({})
    new_no = current_count + 1
    print(date)

    comment = {
        "comment_id": new_no,
        "posting_id": posting_id,
        "user_id": user_id,
        "full_name": full_name,
        "content": content,
        "date": date,
        "likepeople": [],
    }
    result = mongo_db.comment_collection.insert_one(comment)  # mongodb insert
    print("creat_ok")
    return jsonify({"msg": "댓글생성 성공", "status": 200})


# [READ] 댓글
@board.route("/<int:idx>/comment/read", methods=["GET"])
# @jwt_required()
def read_comment(idx):
    if request.method == "GET":
        posting_id = idx
        print("commentread_ok")

        lst = []
        for m in mongo_db.comment_collection.find({"posting_id": posting_id}):
            lst.append(
                {
                    # ObjectId를 문자열로 변환
                    "comment_id": m["comment_id"],
                    "posting_id": m["posting_id"],
                    "user_id": m["user_id"],
                    "full_name": m["full_name"],
                    "content": m["content"],
                    "date": m["date"],
                    "likepeople": m["likepeople"],
                    "likepeoplelength": len(m["likepeople"]),
                }
            )
        return jsonify(lst)


# [DELETE] 댓글
@board.route("/<int:idx>/comment/<int:comment_id>", methods=["DELETE"])
# @jwt_required()
def delete_comments(idx, comment_id):
    # ObjectId를 사용하여 문서 삭제
    mongo_db.comment_collection.delete_one({"comment_id": comment_id})
    # 게시글 번호 재할당 로직
    mongo_db.comment_collection.update_many(
        {"comment_id": {"$gt": comment_id}}, {"$inc": {"comment_id": -1}}
    )
    return jsonify({"msg": "삭제성공", "status": 200})


# [CLICK] 댓글 좋아요
@comment.route("/like/click", methods=["POST"])
# @jwt_required()
def comment_click_like():
    body = literal_eval(request.get_json()["body"])
    comment_id = body["comment_id"]
    likeuser = body["likeuser"]

    mongo_db.comment_collection.update_one(
        {"comment_id": comment_id}, {"$push": {"likepeople": likeuser}}
    )

    return jsonify({"msg": "삭제성공", "status": 200})


# [CANCEL] 댓글 좋아요 취소
@comment.route("like/cancel", methods=["POST"])
# @jwt_required()
def comment_click_like_cancel():
    body = literal_eval(request.get_json()["body"])
    comment_id = body["comment_id"]
    likeuser = body["likeuser"]

    mongo_db.comment_collection.update_one(
        {"comment_id": comment_id}, {"$pull": {"likepeople": likeuser}}
    )

    return jsonify({"msg": "삭제성공", "status": 200})
