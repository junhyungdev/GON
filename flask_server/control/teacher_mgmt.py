from model.mongodb import conn_mongodb
from flask_login import UserMixin
from pymongo import MongoClient
from bson import ObjectId
from bson.json_util import dumps
import json

mongo_db = conn_mongodb()

class Teacher():
    def __init__(self,id,hashed_pw,s_n,account,full_name,phone_num,course_id):
        self.id = id
        self.pw = hashed_pw
        self.s_n = s_n
        self.account = account
        self.full_name = full_name
        self.phone_num = phone_num
        self.course_id = course_id
        
    def add_teacher(id,hashed_pw,account,full_name,phone_num):
        mongo_db = conn_mongodb()
        mongo_db.teacher.insert_one({
            "id" : id,
            "hashed_pw" : hashed_pw,
            "account":account,
            "full_name" : full_name,
            "phone_num" : phone_num,
            "course_id" : []
        })

    def check_is_unique(input_id):
        mongo_db = conn_mongodb()
        exist_id = mongo_db.teacher.find_one({'id':input_id})
        print(exist_id)
        
        if exist_id:
            return False
        else:
            return True
    
    def check_is_unique_edit(input_id,teacher_id):
        mongo_db = conn_mongodb()
        exist = mongo_db.teacher.find_one({'id':input_id})
        
        if exist:
            if str(exist['_id']) == teacher_id:
                print(exist['id'])
                print(input_id)
                return True
            else:
                return False
        else:
            return True
        
    def delete_teacher(teacher_id):
        mongo_db = conn_mongodb()
        delete_condition={"_id":ObjectId(teacher_id)}
        rows = mongo_db.course.find({"teacher_id":teacher_id})
        for row in rows:
            row['teacher_id'].remove(teacher_id)
            target = {"_id":ObjectId(row['_id'])}
            update_data = {'$set':{"teacher_id":row['teacher_id']}}
            mongo_db.course.update_one(target,update_data)
            
        # if row:
        #     target = {"teacher_id":ObjectId(teacher_id)}
        #     update_data = {'$set':{"teacher_id":None}}
        #     mongo_db.course.update_one(target,update_data)
        
        mongo_db.teacher.delete_one(delete_condition)
    
    def edit_teacher(target,new_data):
        mongo_db = conn_mongodb()
        
        result = mongo_db.teacher.update_one(target,new_data)
        #print(result.modified_count) 
        return result
    
    def find_by_teacher_id(teacher_id):
        mongo_db = conn_mongodb()
        row = mongo_db.teacher.find_one({'_id':teacher_id})
        return row
    
    def print_teacher_course_list(teacher_id):
        mongo_db = conn_mongodb()
        #선생님이 담당중인 course의 _id 찾기
        teacher_course_id_list = mongo_db.teacher.find_one({"_id":ObjectId(teacher_id)})['course_id']
        teacher_course_list = []
        
        for course_id in teacher_course_id_list:
            data_list = list(mongo_db.course.find({"_id":ObjectId(course_id)}))
            for data in data_list:
                data['_id'] = str(data['_id'])
                print(type(data))#dict타입
                data['subject_name'] =mongo_db.subject.find_one({'_id':ObjectId(data['subject_id'])})['name']#dict에 subject_name 추가
                teacher_course_list.append(data)
            
        # serialized_student_course_data = dumps(teacher_course_list,default=str)
        # student_course_json_data = json.loads(serialized_student_course_data)
        # return student_course_json_data
        return teacher_course_list

        