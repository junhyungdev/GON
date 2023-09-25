from flask import Blueprint,jsonify,request
from control.assign_release_mgmt import assign_teacher,assign_student,release_teacher,release_student

assign = Blueprint('assign',__name__)

@assign.route('/teacher',methods =['POST'])
def assign_teacher_in_course():
    print("enter in assing_teacher_in_course")
    assign_data = request.get_json()
    print(assign_data)
    print(f"assign_data['teachers']:{assign_data['teachers']}")
    print(f"assign_data['course_id']:{assign_data['course_id']}")
    assign_teacher(assign_data['teachers'],assign_data['course_id'])
    return jsonify({"code":"200","message":"선생님 할당 완료"})

@assign.route('/student',methods = ['POST','DELETE'])
def assign_student_in_course():
    if request.method == "POST":
        assign_data = request.get_json()
        assign_student(assign_data['students'],assign_data['course_id'])
        return jsonify({"code":"200","message":"학생 할당 완료"})
    else:
        param_course_id = request.args.get('course-id')
        param_student_id_list = request.args.getlist('student-id')
        release_student(param_course_id,param_student_id_list)
        
        return jsonify({"code":"200","message":"학생 해제 완료"})
        
@assign.route('/teacher/<course_id>', methods = ['DELETE'])
def delete_teacher_in_course(course_id):
    release_teacher(course_id)
    return jsonify({"code":"200","message":"선생님 해제 완료"})

# @assign.route('/students/<course_id>',methods = ['DELETE'])
# def delete_student_in_course(course_id):
#     release_student_id_list = request.get_json()['student_id']
#     release_student(course_id,release_student_id_list)
#     return jsonify({"code":"200","message":"학생 해제 완료"})