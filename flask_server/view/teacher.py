from flask import Blueprint,request,jsonify
from control.teacher_mgmt import Teacher
from control.student_mgmt import Student
import bcrypt
from model.mongodb import conn_mongodb
from bson.json_util import dumps
import json
from bson import ObjectId

teacher = Blueprint('teacher',__name__)

mongo_db = conn_mongodb()

@teacher.route("/",methods=['POST','GET'])
def teacher_add():
    if request.method == 'POST':
        new_user = request.get_json()
        
        if (not Teacher.check_is_unique(new_user['id']) or not Student.check_id_unique_add(new_user['id'])):
            return jsonify({"code":"400", "message" : "아이디가 중복입니다."})
        else:
            #입력받은 비밀번호 암호화하여 db저장
            new_user['pw'] = bcrypt.hashpw(new_user['pw'].encode('UTF-8'),bcrypt.gensalt())
            
            
            # Teacher.add_teacher(new_user['id'],new_user['pw'],new_user['account'],new_user['full_name'],
            #                     new_user['phone_num'],new_user['course_id']) teacher조회시 course정보를 같이 출력하기 테스트를 위해 course_id 추가
            
            Teacher.add_teacher(new_user['id'],new_user['pw'],new_user['account'],new_user['full_name'],
                                new_user['phone_num'])

            return jsonify({'code':"200",'message':'선생님 회원가입 성공!'})

    elif request.method == 'GET':

        teachers = mongo_db.teacher.find()
        teacher_list = []
        print(teachers)
        for teacher in teachers:
            data = {}
            data['_id'] = str(teacher['_id'])
            data['full_name'] = str(teacher['full_name'])
            data['id'] = str(teacher['id'])
            data['phone_num'] = str(teacher['phone_num'])
            teacher_list.append(data)
        
        return jsonify(teacher_list)
    
@teacher.route('/<teacher_id>', methods = ['DELETE','PATCH'])
def teacher_crud(teacher_id):
    
    if request.method == "DELETE":
        Teacher.delete_teacher(teacher_id)
        return jsonify({"code":"200","message":"삭제가 완료되었습니다."})
    
    if request.method == "PATCH":
        input_data = request.json
        
        if not Teacher.check_is_unique_edit(input_data['id'],teacher_id):
            return jsonify({"code":"400", "message" : "아이디가 중복입니다."})
        else:
            input_data['pw'] = bcrypt.hashpw(input_data['pw'].encode('UTF-8'),bcrypt.gensalt())
            target = {"_id":ObjectId(teacher_id)}

            new_data = {"$set":{
                'id': input_data['id'],
                 'hashed_pw' : input_data['pw'],
                'full_name' : input_data['full_name'],
                'phone_num' : input_data['phone_num']
                }}
 
            result = Teacher.edit_teacher(target,new_data)
        
            if result.modified_count == 0:
                return jsonify({"code":"400","message":"수정할 선생님을 찾을 수 없습니다."})
            else:
                return jsonify({'code':"200",'message':'선생님정보 수정성공!'})

@teacher.route('/courses/<teacher_id>',methods = ['GET'])
def teacher_course_list(teacher_id):
    teacher_courses = Teacher.print_teacher_course_list(teacher_id)
    return jsonify(teacher_courses)