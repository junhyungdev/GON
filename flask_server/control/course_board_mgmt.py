from model.mongodb import conn_mongodb
from flask import Flask, request, jsonify, Blueprint
from ast import literal_eval
from datetime import datetime, timedelta, date
import pymongo
from pymongo import MongoClient
from bson import ObjectId
from bson.json_util import dumps
import json
from view.course import course
import jwt

course_board = Blueprint("course_board", __name__)


mongo_db = conn_mongodb()


# [READ] 사용자 별 coures List 조회
@course.route("/list", methods=["GET"])
def course_list():
    secret_key = "gonitproject"
    token = request.headers.get("Authorization")
    try:
        payload = jwt.decode(token, secret_key, "HS256")
        # payload['exp']는 Numeric date 타입이고 datetime.utcnow()는 datetime.datetime타입이므로  Numeric date타입을 (UNIX 타임스탬프)로 변환
        if datetime.fromtimestamp(payload["exp"]) < datetime.utcnow():
            payload = None
    except:
        payload = None

    if payload == None:
        return jsonify({"code": "400", "message": "토큰이 유효하지 않습니다."})
    else:
        result = mongo_db.student.find_one({"id": payload["user_id"][0]})
        if result == None:
            result = mongo_db.teacher.find_one({"id": payload["user_id"][0]})
        # Find and sort documents in the 'course_collection'
        cursor = mongo_db.course.find(
            {
                "$or": [
                    {"student_id": str(ObjectId(result["_id"]))},
                    {"teacher_id": str(ObjectId(result["_id"]))},
                ]
            }
        )

        course_result = []

        for course_document in cursor:
            subject_id = course_document["subject_id"]
            subject_id = ObjectId(subject_id)
            subject = mongo_db.subject.find_one({"_id": subject_id})
            name = subject["name"]

            result = {
                "course_id": str(course_document["_id"]),
                "subject_id": str(subject_id),
                "subject_name": name,
                "grade": str(course_document["grade"]),
                "section": str(course_document["section"]),
                "batch": str(course_document["batch"]),
            }

            course_result.append(result)
        course_result.sort(key=lambda x: x["subject_name"])

        if len(course_result) == 0:
            return jsonify({"msg": "course list 조회 실패", "status": 400})

        return jsonify(
            {"msg": "course list 조회 성공", "status": 200, "list": course_result}
        )


# [CREATE] 게시글 생성
@course_board.route("/create", methods=["POST"])
# @jwt_required()
def create_article(coidx):
    body = literal_eval(request.get_json()["body"])
    user_id = body["user_id"]
    title = body["title"]
    content = body["content"]
    full_name = body["full_name"]
    attachmentUrl = body["attachmentUrl"]
    publish_date = datetime.now()
    # postingid = str(user_id) + ";" + str(publish_date)

    # 게시글 번호 찾기
    filter_condition = {"course_id": coidx}
    current_count = mongo_db.course_board_collection.count_documents(filter_condition)
    new_no = current_count + 1

    print(content, publish_date, type(user_id))
    article = {
        "course_id": coidx,
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

    result = mongo_db.course_board_collection.insert_one(article)  # mongodb insert
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
@course_board.route("/", methods=["GET"])
# @jwt_required()
def read_article_list(coidx):
    if request.method == "GET":
        print("read_start")

        # Find and sort documents in the 'course_board_collection'
        result = mongo_db.course_board_collection.find({"course_id": coidx}).sort(
            "publish_date", -1
        )

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
        return jsonify({"msg": "게시글 조회 성공", "status": 200, "list": lst})


# [READ] 게시글 내용 읽기
@course_board.route("/<int:idx>", methods=["GET"])
# @jwt_required()
def read_article(idx, coidx):
    if request.method == "GET":
        print("read_start")
        lst = []
        date_now = datetime.now()

        for m in mongo_db.course_board_collection.find(
            {"course_id": coidx, "posting_id": idx}
        ):
            # Count comments using count_documents()
            commentCount = mongo_db.coures_comment_collection.count_documents(
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
@course_board.route("/<int:idx>/update", methods=["POST"])
# @jwt_required()
def modify_article(idx, coidx):
    body = literal_eval(request.get_json()["body"])
    print(body)
    title = body["edittitle"]
    content = body["editContent"]
    date = datetime.now()

    mongo_db.course_board_collection.update_one(
        {"posting_id": idx, "course_id": coidx},
        {"$set": {"title": title, "content": content, "publish_date": date}},
    )
    print("update_ok")
    return jsonify({"msg": "수정완료 성공", "status": 200})


# [DELETE] 게시글 삭제
@course_board.route("/<int:idx>/delete", methods=["DELETE"])
# @jwt_required()
def delete_articles(idx, coidx):
    # 게시글 조회
    article = mongo_db.course_board_collection.find_one(
        {"course_id": coidx, "posting_id": idx}
    )

    if article:
        # 게시글 삭제
        mongo_db.course_board_collection.delete_one(
            {"course_id": coidx, "posting_id": idx}
        )
        # 댓글 삭제
        mongo_db.course_comment_collection.delete_many(
            {"course_id": coidx, "posting_id": idx}
        )

        # 게시글 번호 재할당 로직
        mongo_db.course_board_collection.update_many(
            {"posting_id": {"$gt": idx}}, {"$inc": {"posting_id": -1}}
        )

        return jsonify({"msg": "삭제성공", "status": 200})
    else:
        return jsonify({"msg": "게시글을 찾을 수 없습니다.", "status": 400})


# [CLICK] 게시글 좋아요
@course_board.route("/<int:idx>/like/click", methods=["POST"])
# @jwt_required()
def click_like(coidx, idx):
    body = literal_eval(request.get_json()["body"])
    userid = body["likeuser"]

    mongo_db.course_board_collection.update_one(
        {"course_id": coidx, "posting_id": idx}, {"$push": {"likepeople": userid}}
    )

    return jsonify({"msg": "좋아요 성공", "status": 200})


# [CANCEL] 게시글 좋아요 취소
@course_board.route("/<int:idx>/like/cancel", methods=["POST"])
# @jwt_required()
def click_like_cancel(coidx, idx):
    body = literal_eval(request.get_json()["body"])
    userid = body["likeuser"]

    mongo_db.course_board_collection.update_one(
        {"course_id": coidx, "posting_id": idx}, {"$pull": {"likepeople": userid}}
    )

    return jsonify({"msg": "좋아요 취소 성공", "status": 200})
