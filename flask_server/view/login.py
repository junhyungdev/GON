from flask import (
    Flask,
    Blueprint,
    request,
    make_response,
    jsonify,
    redirect,
    url_for,
    session,
)

from flask_login import login_user, current_user, logout_user
import datetime
import bcrypt
import jwt
from control.teacher_mgmt import Teacher
from datetime import datetime, timedelta
from model.mongodb import conn_mongodb

secret_key = "gonitproject"

user_login = Blueprint("login", __name__)  # login/login_teacher
mongo_db = conn_mongodb()

@user_login.route("/", methods=["POST"])
def login():
    new_user = request.get_json()
    id = new_user['id']
    pw = new_user['password']
    
    if mongo_db.student.find_one({'id':id}):
        row = mongo_db.student.find_one({'id':id})
    elif mongo_db.teacher.find_one({'id':id}):
        row = mongo_db.teacher.find_one({'id':id})
    else:
        row = None
    
    #pw.encode('UTF-8')은 유니코드 문자열인 PW를 UTF-8방식을 이용하여 바이트 문자열로 인코딩, row는 이미 바이트 문자열이다.
    #들어온 입력의 id가 db에 있고 비밀번호가 맞으면 token발행
    if row and bcrypt.checkpw(pw.encode('UTF-8'),row['hashed_pw']):
        user_id = row['id'],
        payload = {
            "user_id": user_id,
            "account": row["account"],
            "full_name": row["full_name"],
            "exp": datetime.utcnow()
            + timedelta(seconds=60 * 60 * 24),  # 24시간 유효,UTC (협정 세계시)로 현재 날짜와 시간을 가져온다.
        }
        token = jwt.encode(payload, secret_key, "HS256")

        return jsonify(
            {
                "code": "200",
                "_id": str(row["_id"]),
                "account": row["account"],
                "full_name": row["full_name"],
                "access_token": token,
            }
        )

    else:
        return jsonify({"code": "400"})
