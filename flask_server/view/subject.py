from flask import Flask, Blueprint, request, make_response,jsonify, redirect, url_for, session
from flask_login import login_user, current_user, logout_user
import datetime
import bcrypt
import jwt
import json
from control.teacher_mgmt import Teacher
from model.mongodb import conn_mongodb
from control.student_mgmt import Student
from control.subject_mgmt import Subject
from control.course_mgmt import Course
from bson import ObjectId

subject = Blueprint('subjects',__name__)#blueprint 객체 생성

mongo_db = conn_mongodb()

#create update read delete

@subject.route('/', methods = ['POST'])
def create_subject():
    new_subject = request.get_json()
    name=new_subject['name']
    is_elective_subject=new_subject['is_elective_subject']


    if Subject.check_is_unique(name,is_elective_subject):
        Subject.add_subject(name,is_elective_subject)
        return jsonify({'code':"200"})
    else:
        return jsonify({
            "code" : "400",
            "message" : "동일한 과목이 존재합니다."
        })

@subject.route('/',methods=['GET'])
def read_subjects():
    json_subject_list=Subject.get_subjects()

    return jsonify(json_subject_list)

@subject.route('/<subject_id>',methods=['DELETE'])
def delete_subject(subject_id):
    if Course.check_subject_assigned_course(subject_id):
        return jsonify({'code':"420",'message':'subject를 삭제할 수 없습니다. 먼저 course를 삭제해 주세요'})
    else:
        Subject.delete_subject(subject_id)
        return jsonify({'code':"200",'message':"subject 삭제 완료!"})
