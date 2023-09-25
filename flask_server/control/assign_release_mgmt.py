from model.mongodb import conn_mongodb
from control.teacher_mgmt import Teacher
from control.course_mgmt import Course
from control.student_mgmt import Student
from bson import ObjectId

def assign_teacher(teachers,course_id):
    print("enter_assign_teacher")
    mongo_db = conn_mongodb()
    
    #선생님에게 course_id 추가, course에 teacher_id추가
    for teacher_data in teachers:
        if teacher_data["_id"] == "":
            continue
        mongo_db.teacher.update_one({"_id":ObjectId(teacher_data['_id'])},{'$push':{"course_id":course_id}})
        mongo_db.course.update_one({"_id":ObjectId(course_id)},{'$push':{"teacher_id":teacher_data['_id']}})   
        
       

def assign_student(students,course_id):
    print("enter in assign_student")
    mongo_db = conn_mongodb()
    target_course = {"_id":ObjectId(course_id)}
    
    for student in students:
        mongo_db.course.update_one(target_course,{'$push':{"student_id":student['_id']}})
        mongo_db.student.update_one({"_id":ObjectId(student['_id'])},{'$push':{"course_id":course_id}})
    
def release_teacher(course_id):
    mongo_db = conn_mongodb()
    row = Course.find_by_course_id(ObjectId(course_id))

    teacher_ids = row['teacher_id']
    for teacher_id in teacher_ids:
        teacher_data = Teacher.find_by_teacher_id(ObjectId(teacher_id))
        print(teacher_data)
        teacher_data["course_id"].remove(course_id)
        mongo_db.teacher.update_one({"_id":ObjectId(teacher_id)},{"$set":teacher_data})
    
    mongo_db.course.update_one({"_id":ObjectId(course_id)},{"$set":{"teacher_id":[]}})

def release_student(course_id,release_student_id_list):
    mongo_db = conn_mongodb()
    course_row = Course.find_by_course_id(ObjectId(course_id))
    print(release_student_id_list)
    for student_id in release_student_id_list:
        print(student_id)
        student_row = Student.find_by_student_id(ObjectId(student_id))
        student_row['course_id'].remove(course_id)
        mongo_db.student.update_one({"_id":ObjectId(student_id)},{"$set":student_row})
        
        course_row['student_id'].remove(student_id)
    mongo_db.course.update_one({"_id":ObjectId(course_id)},{"$set":course_row})
        
    

    
    
    

    