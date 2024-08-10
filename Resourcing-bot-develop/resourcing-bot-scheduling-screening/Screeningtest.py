# working code displaying relevant question paper by fetching questionpaper  from database

from flask import Flask, render_template, json, request, jsonify, session,redirect, url_for
from flask_pymongo import PyMongo,MongoClient
from flask_cors import CORS
import os
from dotenv import load_dotenv
from bson import ObjectId
from bson.regex import Regex
from flask import current_app
import requests
from datetime import datetime, timedelta
import uuid
import pytz
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.secret_key = os.getenv('SECRET_KEY')

# Configure MongoDB
app.config['MONGO_URI'] = os.getenv('MONGO_URI')
mongo = PyMongo(app)
 
# Replace with your MongoDB connection string
client = MongoClient(os.getenv('MONGO_URI'))
db = client['resourcing_bot_db']
users_collection = db['candidate_profiles']
screening_collection = db['screening_tests']
jd_details_collection=db['jd_details']
user=db['users']

 

# Global variables to store question data and correct answers
question_data = []
correct_answers = 0





def generate_token(users_collection,email, candidate_id):
    # Check if the candidate exists with the provided email and candidate_id
    candidate = users_collection.find_one({'candidateEmail': email, 'candidateID': candidate_id})
    if not candidate:
        return "Candidate not found."

    # Generate a new token and set the expiration time to 48 hours from now
    token = str(uuid.uuid4())
    expiration_time = datetime.now() + timedelta(hours=48)

    # Update the CandidateProfile document with the new token and expiration time
    users_collection.update_one(
        {'candidateEmail': email, 'candidateID': candidate_id},
        {'$set': {
            'token': token,
            'token_expiration': expiration_time
        }}
    )
    
    return token





def get_recruiter_contacts(jdid):
    print("jdId:", jdid)
    try:
        # Find the JD details document based on the jdID
        jd_details = jd_details_collection.find_one({'_id': jdid})
        print("jd_details:", jd_details)
        
        # Extract recruiter contacts
        if jd_details:
            recruiter_contacts = jd_details.get('recruiterContacts', [])
            recruiter_emails = []
            # Map recruiter contacts to get emails
            for recruiter_id in recruiter_contacts:
                # Assuming your user collection is named 'users'
                user = db['users'].find_one({'_id': recruiter_id})
                if user:
                    recruiter_emails.append(user.get('email'))
            return recruiter_emails
        else:
            return []
    except Exception as e:
        print("Error occurred while fetching recruiter contacts:", e)
        return []



@app.route('/start-test', methods=['POST'])
def start_test():

  
    try:
        # Retrieve form data
        email = request.form.get('candidate_email')
        key = request.form.get('candidate_key')

        # Check if the email and key match a valid response in the database
        candidate = users_collection.find_one({'candidateEmail': email, 'token': key})
        print("candidate:",candidate)
      


        if candidate:
            
            # Get the token expiration time from the candidate document
            token_expiration = candidate.get('token_expiration')

            # Convert token expiration datetime to UTC timezone
            token_expiration_utc = token_expiration.replace(tzinfo=pytz.utc)

            # Define the desired timezone (e.g., Indian Standard Time)
            asia_kolkata_timezone = pytz.timezone('Asia/Kolkata')

            # Convert token expiration datetime to the desired timezone
            token_expiration_asia = token_expiration_utc.astimezone(asia_kolkata_timezone)

            utc_now = datetime.now(pytz.utc)
            # Check if the token is still valid
            current_time = datetime.utcnow()
            # Convert current time to the desired timezone
            current_time_asia = current_time.astimezone(asia_kolkata_timezone)
            if current_time <= token_expiration:
                # Token is valid, proceed to start the test
                jdid = candidate.get('jddetails_id')
              
                jdid_objectid = ObjectId(jdid)



                # # only for testing in postman use below 
                # jdid = request.form.get('jdid', '663db0c875b366e2a8f8ed70')
                # print("jdid:",jdid)
                # # Convert jdid string to ObjectId
                # jdid_objectid = ObjectId(jdid)
                # print("jdid_objectid:",jdid_objectid)
                  # Call the function to get the recruiter contacts
                recruiter_contacts = get_recruiter_contacts(jdid)
                print("recruiter_contacts:",recruiter_contacts)


                screening_test = screening_collection.find_one({'jd': jdid_objectid})

                # print("screening_test: " ,screening_test)

                if screening_test:
                    screening_test_id = str(screening_test['_id'])
                    screening_test['jd'] = str(screening_test['jd'])
                    # Convert ObjectId to string before storing in the session
                    session['screening_test_id'] = str(screening_test_id)
                    session['candidate_email'] = email
                    session['jdid'] = str(jdid)
                    session['recruiter_contacts']=str(recruiter_contacts)


                    # Retrieve the relevant question paper based on the job ID
                    question_paper = find_relevant_question_paper(jdid_objectid)
                
                    if question_paper:
                        # Extract questions and options from the question paper
                        questions = question_paper.get('questions', [])
                        answer_options = question_paper.get('answer_options', [])

                        # Combine questions with their corresponding options
                        question_option_pairs = list(zip(questions, answer_options))
                      
            
                        # Render the test page with the retrieved question paper
                        return render_template('test.html', question_option_pairs=question_option_pairs,
                                            candidate_id=screening_test_id)
                    else:
                        return "No relevant question paper found for this job."
                else:
                    return "No screening test found for the provided jdid."
            else:
                # Token has expired
                return "Token has expired. Please request a new one."
        else:
            # Email and key do not match any valid response
            return "Invalid email or key. Please try again."
    except Exception as e:
        # Log and handle any errors
        print(f"Error occurred: {str(e)}")
        return "An error occurred while processing the request."



def find_relevant_question_paper(jdid):
    # Query the screeningtest collection using the provided job ID
    screening_test = screening_collection.find_one({'jd': jdid})

    if screening_test:
        # Extract question paper information from the screeningtest document
        question_paper = {
            'questions': [],
            'correct_answers': [],
            'answer_options': [],
            'total_questions': len(screening_test.get('questions', []))
        }

        for question in screening_test.get('questions', []):
            question_paper['questions'].append(question.get('questionText', ''))
            question_paper['correct_answers'].append(question.get('correctAnswer', ''))
            question_paper['answer_options'].append(question.get('answerOptions', []))

        return question_paper

    else:
        return None



@app.route('/submit-test', methods=['POST'])
def submit_test():
    global correct_answers
    global question_data
    
    data = request.json
    # print("Received data:", data)
 
    answers = data.get('answers')
    question_option_pairs = data.get('question_option_pairs')

    # recruiter_contacts = current_app.config.get('SHARED_RECRUITERCONTACTS')
    recruiter_contacts = session.get('recruiter_contacts') 
    print("recruiter_contacts:",recruiter_contacts)

    candidate_email = session.get('candidate_email')  # Retrieve candidate email from session
    print("email:", candidate_email)
    jdid = session.get('jdid')  # Retrieve jdid from session
    print("jdid:", jdid)


    # # only for testing in postman use below 
    # recruiter_contacts = 'bhotlamaha@gmail.com','recruiter1@gmail.com'
    # print("recruiter_contacts:",recruiter_contacts)

    # candidate_email='induerayadav@gmail.com'
    # print("candidate_email:",candidate_email)
 

    # Get screening_test_id from session
    screening_test_id = session.get('screening_test_id')
 
    screening_test_id_object = ObjectId(screening_test_id)
    # screening_test_id_object = str(screening_test_id_object)
    if not question_option_pairs or not screening_test_id:
        return jsonify({'error': 'Invalid data received'}), 400
 
    # Fetch question paper from the database based on screening_test_id
    screening_test = screening_collection.find_one({'_id': screening_test_id_object})
    screening_test_jd_id = screening_test['jd']
 
    if not screening_test:
        return jsonify({'error': 'Screening test not found'}), 404
 
    questions = screening_test.get('questions', [])
    correct_answers = 0
 
    # Compare user's answers with correct answers
    for user_answer, question_data in zip(answers, questions):
        correct_answer = question_data.get('correctAnswer')
        if user_answer == correct_answer:
            correct_answers += 1
    print("correct_answers:", correct_answers)
 
    # Determine if the user passed the test
    qualified = correct_answers >= 10
    print("qualified:", qualified)
 
    # Fetch candidate_profile_id from user_collection based on screening_test_id
    user_data = users_collection.find_one({'jddetails_id': screening_test_jd_id,'candidateEmail':candidate_email})
    if not user_data:
        return jsonify({'error': 'Candidate profile not found'}), 404
     
    if qualified:
        screeningtest_status = 'Screening_test_Passed'
        overall_status = 'TestPassed'
        subject = "Congratulations! You have passed the screening test"
        body = f"Dear Candidate,<br><br>Congratulations! You have successfully passed the screening test. You are qualified for the next stage of the process.<br><br>Best regards,<br>Recruiting Team"
    else:
        screeningtest_status = 'Screening_test_Failed'
        overall_status = 'TestFailed'
        subject = "Notification: Screening Test Result"
        body = f"Dear Candidate,<br><br>We regret to inform you that you did not pass the screening test. Thank you for your participation.<br><br>Best regards,<br>Recruiting Team"
 
    # Update user_collection with screening test information based on qualification
    if qualified:
        screeningtest_status = 'Screening_test_Passed',
        
    else:
        screeningtest_status = 'Screening_test_Failed'
 
    result = users_collection.update_one(
        {'_id': user_data['_id']},
        {'$set': {
            'screeningtestStatus': screeningtest_status,
            'screeningtestid': screening_test_id_object,
            'overallStatus': overall_status
        }}
    )
    print("result:", result)
 
    # Send email to candidate
    send_email_data = {
        'candidateEmail': [candidate_email],
        'subject': subject,
        'body': body
    }

    if candidate_email:
        response = requests.post('http://127.0.0.1:3004/sendEmail', json=send_email_data)
        if response.status_code == 200:
            print("Email sent successfully to candidate:", candidate_email)
        else:
            print("Failed to send email to candidate")
    else:
        print("Candidate email is None, skipping email sending.")


    if recruiter_contacts:
         send_email_data = {
            'candidateEmail': [recruiter_contacts],
            'subject': f"Screening Test Completed for Candidate",
            'body': f"Hi Recruiter, {candidate_email} has completed the screening test for the job. Log in to view the results and proceed accordingly."
        }
    response = requests.post('http://127.0.0.1:3004/sendEmail', json=send_email_data)
    print("response:",response)
    if response.status_code == 200:
        print(f"Email sent successfully to recruiters {recruiter_contacts}")
    else:
        print(f"Failed to send email to recruiter {recruiter_contacts}")


    # Redirect the user based on the test result
    if qualified:
        return jsonify({'message': 'success', 'redirect_url': '/qualification-success'})
    else:
        return jsonify({'message': 'failure', 'redirect_url': '/qualification-failure'})
 

@app.route('/qualification-success')
def qualification_success():
    return render_template('qualification_success.html')

 

@app.route('/qualification-failure')
def qualification_failure():
    return render_template('qualification_failure.html')

 

if __name__ == '__main__':
    app.run(debug=True, port=5002, host='0.0.0.0')






















































