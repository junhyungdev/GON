from flask import Blueprint, request,jsonify
from model.mongodb import conn_mongodb
from bson import ObjectId
from control.student_mgmt import Student
import bcrypt
from control.teacher_mgmt import Teacher

password_change = Blueprint('password_change',__name__)

@password_change.route('/<user_id>',methods = ['PATCH'])
def pw_change(user_id):
    input_data = request.json
    mongo_db = conn_mongodb()
    incode_input_data = input_data['current_password'].encode('UTF-8')
    
    if mongo_db.student.find_one({"_id":ObjectId(user_id)}):
        row = Student.find_by_student_id(ObjectId(user_id))
        stored_password_hash = row['hashed_pw']
        
        if not bcrypt.checkpw(incode_input_data,stored_password_hash):
            return jsonify({"code":"400","message":"현재 비밀번호가 일치하지 않습니다."})
        else:
            input_data['new_password'] = bcrypt.hashpw(input_data['new_password'].encode('UTF-8'),bcrypt.gensalt())
            
            target = {"_id":ObjectId(user_id)}
            new_data = {"$set":{'hashed_pw' : input_data['new_password'],}}
            Student.edit_student(target,new_data)
            return jsonify({"code":"200","message":"비밀번호 변경 완료"})
                 
    elif mongo_db.teacher.find_one({"_id":ObjectId(user_id)}):
        row = Teacher.find_by_teacher_id(ObjectId(user_id))
        stored_password_hash = row['hashed_pw']
        
        if not bcrypt.checkpw(incode_input_data, stored_password_hash):
            return jsonify({"code":"400","message":"현재 비밀번호가 일치하지 않습니다."})
        else:
            input_data['new_password'] = bcrypt.hashpw(input_data['new_password'].encode('UTF-8'),bcrypt.gensalt())
            target = {"_id":ObjectId(user_id)}
            new_data = {"$set":{'hashed_pw' : input_data['new_password'],}}
            Teacher.edit_teacher(target,new_data)
            return jsonify({"code":"200","message":"비밀번호 변경 완료"})
    else:
        return jsonify({"code":"400","message":"사용자를 찾을 수 없습니다."})