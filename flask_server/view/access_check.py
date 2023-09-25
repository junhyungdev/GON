import jwt
from datetime import datetime, timedelta
from flask import jsonify, Blueprint, request

secret_key = "gonitproject"

access_check = Blueprint("access_check", __name__)

# request헤더에서 토큰 받아오는 법 request.headers.get('Authorization')


@access_check.route("/", methods=["GET"])
def check_access_token():
    token = request.headers.get("Authorization")
    print("-------------------------------------------")
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
        return jsonify({"code": "200", "account": payload["account"]})
