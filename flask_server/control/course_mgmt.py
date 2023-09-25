from model.mongodb import conn_mongodb
from bson import ObjectId
from bson.json_util import dumps
import json


class Course:
    def __init__(self, grade, section, batch, subject_id, teacher_id, student_id):
        self.grade = grade
        self.section = section
        self.batch = batch
        self.subject_id = subject_id
        self.teacher_id = teacher_id
        self.student_id = student_id

    def check_subject_assigned_course(subject_id):
        mongo_db = conn_mongodb()
        if mongo_db.course.find_one({'subject_id':subject_id}):
            return True
        else:
            return False
            


    def check_is_unique(grade, section, batch, subject_id):
        query = {
            "grade": grade,
            "section": section,
            "batch": batch,
            "subject_id": subject_id,
        }
        mongo_db = conn_mongodb()
        matching_course = mongo_db.course.count_documents(query)

        if matching_course > 0:
            print("같은 course가 이미 존재합니다")
            return False
        else:
            print("같은 course는 아직 존재하지 않습니다")
            return True

    def add_course(grade, section, batch, subject_id):
        print("enter add_course in Course class")
        mongo_db = conn_mongodb()
        mongo_db.course.insert_one(
            {
                "grade": grade,
                "section": section,
                "batch": batch,
                "subject_id": subject_id,
                "student_id": [],
                "teacher_id": [],
            }
        )

    def get_courses():
        print("enter get_courses in Course class")
        mongo_db = conn_mongodb()
        courses = mongo_db.course.find()
        course_list = []
        for course in courses:
            # print(course)
            course["_id"] = str(course["_id"])
            if "teacher_id" in course:
                teacher_id_list=course["teacher_id"]
                course["teacher_name"]=[]
                for teacher_id in teacher_id_list:
                    teacher_cursor = mongo_db.teacher.find({"_id":ObjectId(teacher_id)})
                    for teacher_document in teacher_cursor:
                        teacher_name=teacher_document["full_name"]
                        course["teacher_name"].append(teacher_name)
                
            if "subject_id" in course:  # 'subject_id' 키가 있는지 확인
                subject_id = course["subject_id"]
                # print(f"subject_id:{subject_id}")
                subject_cursor = mongo_db.subject.find({"_id": ObjectId(subject_id)})

                for subject_document in subject_cursor:
                    # print("subject_document",subject_document)

                    subject_name = subject_document["name"]
                    is_elective_subject = subject_document["is_elective_subject"]
                    course["subject_name"] = subject_name
                    course["is_elective_subject"] = is_elective_subject
                
                course["subject_id"] = str(course["subject_id"])
                # print(f"modified course{course}")
                course_list.append(course)
            
            else:
                # print("'subject_id' key not found in course:", course)
                course_list.append(course)
            

        return course_list

    def delete_course(course_id):
        mongo_db = conn_mongodb()
        result = mongo_db.course.delete_one({"_id": ObjectId(course_id)})
        teacher_rows = mongo_db.teacher.find({"course_id":course_id})
        student_rows = mongo_db.student.find({"course_id":course_id})
        for row in teacher_rows:
            row['course_id'].remove(course_id)
            target = {"_id":ObjectId(row['_id'])}
            update_data = {'$set':{"course_id":row['course_id']}}
            mongo_db.teacher.update_one(target,update_data)
            
        for row in student_rows:
            row['course_id'].remove(course_id)
            target = {"_id":ObjectId(row['_id'])}
            update_data = {'$set':{"course_id":row['course_id']}}
            mongo_db.student.update_one(target,update_data)
            
        if result.deleted_count == 1:
            return f"subject doucument with _id {course_id} deleted successfully"

    def delete_courses():
        mongo_db = conn_mongodb()
        result = mongo_db.course.delete_many({})

        return f"삭제된 문서 수: {result.deleted_count}"

    def find_by_course_id(course_id):
        mongo_db = conn_mongodb()
        row = mongo_db.course.find_one({"_id": course_id})
        return row

    def print_course_student_list(course_id):
        mongo_db = conn_mongodb()
        students = mongo_db.student.find(
            {"course_id": str(course_id)}
        )  # find는 cursor객체를 반환하는데 아래 for문으로 list에 append하면 객체 주소가 아닌 실제 데이터가 출력?
        print(students)
        student_list = []
        for student in students:
            student_list.append(student)
        print(student_list)

        others = mongo_db.student.find({"course_id": {"$ne": str(course_id)}})
        print(others)
        others_list = []
        for other in others:
            others_list.append(other)

        serialized_student_data = dumps(student_list, default=str)
        student_json_data = json.loads(serialized_student_data)
        serialized_others_data = dumps(others_list, default=str)
        others_json_data = json.loads(serialized_others_data)

        return student_json_data, others_json_data

    def print_teacher_assigend_courses():
        mongo_db = conn_mongodb()
        courses = mongo_db.course.find({"teacher_id": {"$ne": []}})
        teacher_assigned_courses = []

        for course in courses:
            course["_id"] = str(course["_id"])
            subject_name = mongo_db.subject.find_one(
                {"_id": ObjectId(course["subject_id"])}
            )["name"]
            course["subject_name"] = subject_name
            course["teacher_name"] = []
            for teacher_id in course["teacher_id"]:
                course["teacher_name"].append(mongo_db.teacher.find_one({"_id":ObjectId(teacher_id)})['full_name'])
            teacher_assigned_courses.append(course)
            
            

        return teacher_assigned_courses

    def print_teacher_not_assigend_courses():
        mongo_db = conn_mongodb()
        courses = mongo_db.course.find({"teacher_id": []})
        teacher_not_assigned_courses = []
        subject_name = ""

        for course in courses:
            course["_id"] = str(course["_id"])
            try:
                subject_name = mongo_db.subject.find_one(
                    {"_id": ObjectId(course["subject_id"])}
                )["name"]
                course["subject_name"] = subject_name
            except:
                course["subject_name"] = ""
                
            
            teacher_not_assigned_courses.append(course)

        return teacher_not_assigned_courses
