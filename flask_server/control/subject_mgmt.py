from model.mongodb import conn_mongodb
import json
from bson import ObjectId

class Subject():
    def __init__(self,name,is_elective_subject):
        self.name = name
        self.is_elective_subject = is_elective_subject

    def add_subject(name,is_elective_subject):
        print("enter add_subject in Subject class")
        mongo_db = conn_mongodb()
        mongo_db.subject.insert_one({
            "name" : name,
            "is_elective_subject" : is_elective_subject
        })

    def check_is_unique(name, is_elective_subject):
        mongo_db = conn_mongodb()
        exist_name = mongo_db.subject.find_one({'name': name})
        #exist_is_elective_subject = mongo_db.subject.find_one({'is_elective_subject': is_elective_subject})
        print(name)
        print(is_elective_subject)

        #두 field(name과 is_elective_subject)가 같을 경우에만 false 리턴
        if exist_name:
            return False
        else:
            return True


    def get_subjects():
        print("enter in get_subjects()")
        mongo_db = conn_mongodb()
        subjects=mongo_db.subject.find({})
        print(subjects)
        subject_list=[]
        for subject in subjects:
            subject['_id'] = str(subject['_id'])
            subject_list.append(subject)
            # print(subject)

        #subjects_json = json.dumps(subject_list)

        # Print or use the JSON data as needed

        # return subjects_json
        return subject_list


    def delete_subject(subject_id):
        mongo_db = conn_mongodb()
        subject_id = ObjectId(subject_id)
        mongo_db.subject.delete_one({'_id':ObjectId(subject_id)})
        