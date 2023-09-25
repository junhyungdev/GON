from flask import Flask, Blueprint, request, make_response, jsonify, redirect, url_for, session
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

course = Blueprint('courses', __name__)  # blueprint 객체 생성

mongo_db = conn_mongodb()

# create update read delete

@course.route('/', methods=['POST'])
def create_course():
    new_course = request.get_json()
    # {
    #     "grade": "grade",
    #     "section": "section",
    #     "batch": "batch",
    #     "subject_id": "subject_id"
    # }
    grade = new_course['grade']
    section = new_course['section']
    batch = new_course['batch']
    subject_id = new_course['subject_id']


    if Course.check_is_unique(grade, section,batch,subject_id):
        Course.add_course(grade,section,batch,subject_id)
        return jsonify({
            "code": "200"
        })

    else:
        return jsonify({
            "code": "400",
            "message": "동일한 course가 존재합니다."
        })


@course.route('/', methods=['GET'])
def read_courses():
    print("enter in read_courses")
    result=Course.get_courses()
    return jsonify(result)




@course.route('/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    result_message=Course.delete_course(course_id)
    print(result_message)
    return jsonify({'code': "200"})


@course.route('/', methods=['DELETE'])
def delete_courses(): #전체 course 삭제
    print("enter in delete_courses()")
    result_message=Course.delete_courses()
    print(result_message)
    return jsonify({'code': "200"})


#/api/courses/{course_id}/students
@course.route('/<course_id>/students',methods = ['GET'])
def course_student_list(course_id):
    student_list,others = Course.print_course_student_list(ObjectId(course_id))

    return jsonify({"course_student":student_list,"not_course_student":others})

@course.route('/assigned',methods = ['GET'])
def teacher_assigend_courses():
    course_list = Course.print_teacher_assigend_courses()
    return jsonify(course_list)

@course.route('/not-assigned',methods = ['GET'])
def teacher_not_assigend_courses():
    course_list = Course.print_teacher_not_assigend_courses()
    return jsonify(course_list)