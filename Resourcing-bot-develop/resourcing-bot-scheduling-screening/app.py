#---------------working code---------------------

from flask import Flask, request, jsonify,render_template
from email_sender import send_email_to_candidate
from datetime import datetime, timedelta
from flask_cors import CORS
from flask_restful import Api
from flask_pymongo import PyMongo,MongoClient
from Screeningtest import generate_token
from bson import ObjectId
import os

# Global variables to store question data and correct answers
question_data = []
correct_answers = 0

from Screeningtest import start_test, submit_test, qualification_success, qualification_failure

unique_emails = set()

# Set to keep track of emails with stored responses and their submission time
response_data = {}

app = Flask(__name__, template_folder='templates')
app.secret_key = '5401f0bec35816fc6cd61d303ff4f7ad4ba5ec6613039d74'




CORS(app)  # Enable CORS for all routes
api = Api(app)

# Configure MongoDB
app.config['MONGO_URI'] = os.getenv('MONGO_URI')
mongo = PyMongo(app)

# Configure MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['resourcing_bot_db']
users_collection = db['candidate_profiles']
jd_details_collection=db['jd_details']
cursor = users_collection.find()

 

app.secret_key = '5401f0bec35816fc6cd61d303ff4f7ad4ba5ec6613039d74'


@app.route('/screening_test_email', methods=['POST'])
def send_email():
    data = request.json
    email = data.get('email')
    jdid = data.get('jdId')
    recruitercontacts = data.get('recruiterContacts')

    app.config['SHARED_JDID'] = jdid
    app.config['SHARED_EMAIL'] = email
    app.config['SHARED_RECRUITERCONTACTS'] = recruitercontacts

  

    # Ensure jdid is of type ObjectId
    if not ObjectId.is_valid(jdid):
        print(f"Invalid ObjectId: {jdid}")
        return jsonify({'message': 'Invalid JD ID'}), 400

    jd_details_id = ObjectId(jdid)

    # Check if the document exists
    user_document = users_collection.find_one({'candidateEmail': email, 'jddetails_id': jd_details_id})
    if not user_document:
        # print(f"No user document found for email {email} and JD ID {jdid}")
        return jsonify({'message': 'User document not found'}), 404

    print("Found user document:", user_document)

    candidate_id = user_document.get('candidateID')
    # Generate token for the candidate
    token = generate_token(users_collection, email, candidate_id)
   
    send_email_to_candidate(email, token) 


    # Update user_collection with screening test information
    user_update_result = users_collection.update_one(
        {'candidateEmail': email, 'jddetails_id': jd_details_id},
        {'$set': {
            'screeningtestid': None,
            'screeningtestStatus': 'Screening_test_email_sent',
            'overallStatus': 'TestSent'
        }}
    )
    # print(f"User update result: {user_update_result.raw_result}")

    return jsonify({'candidateId': candidate_id, 'token': token, 'message': 'Email request received successfully'})




# Routes for Screening Test
app.add_url_rule('/start-test', 'start_test', start_test, methods=['POST'])
app.add_url_rule('/submit-test', 'submit_test', submit_test, methods=['POST'])
app.add_url_rule('/qualification-success', 'qualification_success', qualification_success)
app.add_url_rule('/qualification-failure', 'qualification_failure', qualification_failure)



@app.route('/respond', methods=['GET'])
def respond():
    try:
        email = request.args.get('email')
        response = request.args.get('response')

        # Check if the email has responded within the 24-hour time limit
        if email in response_data and (datetime.now() - response_data[email]).total_seconds() > 48 * 60 * 60:
            return render_template('timeout.html')

        # Record the submission time for the email
        response_data[email] = datetime.now()

        # Render different HTML pages based on the response
        if response == 'interested':
            return render_template('thankyou.html')
        else:
            return render_template('thank.html')  # You can customize this for other responses

    except Exception as e:
        print(f"Error in /respond route:", e)
        return jsonify({'error': 'Internal Server Error'}), 500


@app.route('/thank-you')
def thank_you():
    return render_template('thankyou.html')

@app.route('/thank')
def thank():
    return render_template('thank.html')


@app.route('/login')
def login():
    return render_template('login.html')


if __name__ == '__main__':
    app.run( port=5008, host='0.0.0.0')