from model.mongodb import conn_mongodb
from flask_login import UserMixin
from bson import ObjectId
from flask import jsonify
from bson.json_util import dumps
import json

class Student():
    def __init__(self,id,hashed_pw,account,s_n,full_name,phone_num,father_phone_num,mother_phone_num,guardians_phone_num, course_id):
        self.id=id
        self.hashed_pw = hashed_pw
        self.account = account
        self.s_n = s_n
        self.full_name = full_name
        self.phone_num = phone_num
        self.fatehr_phone_num = father_phone_num
        self.mother_phone_num = mother_phone_num
        self.guardians_phone_num = guardians_phone_num
        self.course_id = course_id
    
    def add_student(id,hashed_pw,account,s_n,full_name,phone_num,father_phone_num,mother_phone_num,guardians_phone_num):
        mongo_db = conn_mongodb()
        mongo_db.student.insert_one({
            "id" : id,
            "hashed_pw" : hashed_pw,
            "account":account,
            "s_n" : s_n,
            "full_name" : full_name,
            "phone_num" : phone_num,
            "father_phone_num" : father_phone_num,
            "mother_phone_num" : mother_phone_num,
            "guardians_phone_num" : guardians_phone_num,
            "course_id" : []
        })
        
    def delete_student(student_id):
        mongo_db = conn_mongodb()
        delete_condition={"_id":ObjectId(student_id)}
        rows = mongo_db.course.find({"student_id":student_id})
        
        for row in rows:
            print("77777777777777777")
            print(type(row['student_id']))
            row['student_id'].remove(student_id)
            target = {"_id":ObjectId(row['_id'])}
            update_data = {'$set':{"student_id":row['student_id']}}
            mongo_db.course.update_one(target,update_data)
        
        mongo_db.student.delete_one(delete_condition)
    
    
    def edit_student(target,new_data):
        mongo_db = conn_mongodb()
        print("enter edit_student")
        result = mongo_db.student.update_one(target,new_data)
        print(result.modified_count) 
        return result
    
    def check_is_unique(input_id,input_sn):
        mongo_db = conn_mongodb()
        exist_id = mongo_db.student.find_one({'id':input_id})
        exist_s_n = mongo_db.student.find_one({'s_n':input_sn})
        print(input_sn)
        print(type(input_sn))
        print(exist_s_n)
        
        if exist_id or exist_s_n:
            return False
        else:
            return True
    
    def check_is_unique_edit(input_id,input_sn,student_id):
        mongo_db = conn_mongodb()
        exist_id = mongo_db.student.find_one({'id':input_id})
        exist_sn = mongo_db.student.find_one({'s_n':int(input_sn)})
        print(input_sn)
        print(type(input_sn))
        print(exist_sn)
        
        if exist_id or exist_sn:
            if exist_id and not exist_sn:
                if str(exist_id['_id']) == student_id:
                    return True
                else:
                    print("1")
                    return False
            elif not exist_id and exist_sn:
                if str(exist_sn['_id']) == student_id:
                    return True
            else:
                if str(exist_id['_id']) == student_id and str(exist_sn['_id']) == student_id:
                    print("2")
                    return True
                else:
                    return False
        else:
            return True
        
    def check_id_unique_edit(input_id,student_id):
        mongo_db = conn_mongodb()
        exist_id = mongo_db.student.find_one({'id':input_id})
        if exist_id:
            if str(exist_id['_id']) == student_id:
                return True
            else:
                return False
        else:
            return True
    
    def check_sn_unique_edit(input_sn,student_id):
        mongo_db = conn_mongodb()
        exist_sn = mongo_db.student.find_one({'s_n':int(input_sn)})
        if exist_sn:
            if str(exist_sn['_id']) == student_id:
                return True
            else:
                return False
        else:
            return True
    
    
        
    def find_by_student_id(student_id):
        mongo_db = conn_mongodb()
        row = mongo_db.student.find_one({'_id':student_id})
        return row
    
    def print_student_course_list(student_id):
        mongo_db = conn_mongodb()
        #학생이 수강중인 course의 _id 찾기
        student_course_id_list = mongo_db.student.find_one({"_id":ObjectId(student_id)})['course_id']
        student_course_list = []
        
        for course_id in student_course_id_list:
            data_list = list(mongo_db.course.find({"_id":ObjectId(course_id)}))
            for data in data_list:
                data['_id'] = str(data['_id'])
                print(type(data))#dict타입
                data['subject_name'] =mongo_db.subject.find_one({'_id':ObjectId(data['subject_id'])})['name']#dict에 subject_name 추가
                student_course_list.append(data)
            
        return student_course_list            
        # serialized_student_course_data = dumps(student_course_list,default=str)
        # student_course_json_data = json.loads(serialized_student_course_data)
        # return student_course_json_data
    
    def check_id_unique_add(input_id):
        mongo_db = conn_mongodb()
        exist_id = mongo_db.student.find_one({'id':input_id})
        
        if exist_id:
            return False
        else:
            return True
    
    def check_sn_unique_add(s_n):
        mongo_db = conn_mongodb()
        exist_sn = mongo_db.student.find_one({'s_n':s_n})
        
        if exist_sn:
            return False
        else:
            return True
       