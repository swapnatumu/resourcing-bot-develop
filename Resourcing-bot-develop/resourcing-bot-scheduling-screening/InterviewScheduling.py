import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import request, jsonify,Flask,session
from datetime import datetime, timedelta
from flask_bcrypt import Bcrypt
from google.oauth2 import service_account
from googleapiclient.discovery import build
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from transformers import pipeline
from bson.objectid import ObjectId
from flask import current_app
from flask_restful import Api
from urllib.parse import unquote


load_dotenv()

app = Flask(__name__)
app.secret_key = '5401f0bec35816fc6cd61d303ff4f7ad4ba5ec6613039d74'

CORS(app)
api = Api(app)

bcrypt = Bcrypt(app)

# Replace with your Google Calendar credentials
SCOPES_CALENDAR = ['https://www.googleapis.com/auth/calendar']
# SERVICE_ACCOUNT_FILE_CALENDAR = '/home/indhu/Desktop/Resourcing-bot/primeval-yew-408906-1b6efffee66d.json'
SERVICE_ACCOUNT_FILE_CALENDAR = '../../../primeval-yew-408906-1b6efffee66d.json'
CALENDAR_ID = "scheduling-224@primeval-yew-408906.iam.gserviceaccount.com"
 
 
# Replace with your Google Meet credentials
SCOPES_MEET = ['https://www.googleapis.com/auth/calendar.events']
# SERVICE_ACCOUNT_FILE_MEET = '/home/indhu/Desktop/Resourcing-bot/primeval-yew-408906-1b6efffee66d.json'
SERVICE_ACCOUNT_FILE_MEET = '../../../primeval-yew-408906-1b6efffee66d.json'



# SMTP Email Configuration
SMTP_SERVER = "smtp.elasticemail.com"
SMTP_PORT = 2525
# SMTP_PASSWORD="10F9AE2E5D20E7F59CC93D8CC24DA4850A68"
# SMTP_USERNAME ="induerayadav@gmail.com"
#new credentails for free usage
SMTP_PASSWORD="7CC84F3872031F32975A12C5CA0FDEABEB9B"
SMTP_USERNAME ="indusri4517@gmail.com"
 
 
google_meet_link="https://meet.google.com/cad-zhnr-tyx"
 
 
client = MongoClient(os.getenv('MONGO_DB_URI'))
db = client['resourcing_bot_db']
collection = db['interviews']
candidateprofiles=db["candidate_profiles"]
jd_details_collection=db['jd_details']
 
 
 
 
def send_email(recipient_emails, subject, body):
    print("received email:",recipient_emails)
    try:
        smtp_server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        smtp_server.starttls()
        smtp_server.login(SMTP_USERNAME, SMTP_PASSWORD)
    
 
        for recipient_email in recipient_emails:
            print("recipient_email:",recipient_email)
            message = MIMEMultipart()
            message['From'] = SMTP_USERNAME
            message['To'] = recipient_email
            message['Subject'] = subject
            
            # Check if the body is None or empty
            if body:
                message.attach(MIMEText(body, 'html'))
            else:
                message.attach(MIMEText('', 'html'))  
 
            smtp_server.sendmail(SMTP_USERNAME, recipient_email, message.as_string())
 
            # print(f"Email sent successfully to {recipient_email}")
        print("Email sent successfully to:", recipient_email)
 
 
        smtp_server.quit()
 
    except Exception as e:
        print(f"Error sending email:", e)
 
 
 
 
@app.route('/schedule', methods=['POST'])
def schedule_interview():
    try:
        print("Request JSON:", request.json)
        jd_id = request.json.get('jdId')
        candidate_email = request.json.get('candidateEmail')
        interviewer_emails = request.json.get('interviewerEmails')
        # # recruiter_emails = request.json.get('recruiterEmails')
        # recruiter_emails_str = request.json.get('recruiterEmails')
        # print("recruiter_emails_str:", recruiter_emails_str)

        # # Check for None values and handle them appropriately
        # if jd_id is None or candidate_email is None or interviewer_emails is None or recruiter_emails_str is None:
        #     return jsonify({'error': 'Missing required fields in request JSON'}), 400
        
        
        # # Decode the recruiter emails string and split into a list
        # recruiter_emails = unquote(recruiter_emails_str).split(',')
        
        print("interviewer_emails:",interviewer_emails)
        # print("recruiter_emails:",recruiter_emails)
 
        
        # Get interview time from the request
        interview_time_str = request.json.get('interview_time')
        interview_time = datetime.strptime(interview_time_str, '%Y-%m-%dT%H:%M:%S')
 
        # Schedule Google Meet appointment
        google_meet_link = schedule_google_meet_direct( candidate_email, interview_time)

        # Insert interview details into the database
        inserted_id = collection.insert_one({
            'jddetails_id': jd_id,
            'candidate_email': candidate_email,
            'interviewer': interviewer_emails,
            'interview_time': interview_time,
            # 'recruiter': recruiter_emails,
            'google_meet_link': google_meet_link
        }).inserted_id

        app.config['SHARED_INSERTEDID'] = inserted_id
        print("app.config['SHARED_JDID']:", app.config['SHARED_INSERTEDID'])

        # Send email to the candidate
        candidate_subject = f'Interview Invitation'
        candidate_body = f"""
            <p>Hello,</p>
            <p>I hope this email finds you well.</p>
            <p>I am writing to invite you to interview. We were impressed by your application and believe that you could be a great fit for our team.</p>
            <p style="font-weight: bold; font-size: 16px;">Interview Time: {interview_time}</p>
             <p style="font-weight: bold; font-size: 16px;">Format:VideoConference</p>
            <p style="font-weight: bold; font-size: 16px;">Duration:1 Hour</p>
            <p>Please confirm your availability for the scheduled interview by replying to this email at your earliest convenience. If you have any questions or need to reschedule, feel free to reach out to me.</p>
            <p>We are excited about the opportunity to speak with you and learn more about your qualifications and experiences.</p>
            <p>Please join the interview using the following Google Meet link: <a href="{google_meet_link}" target="_blank">Click here to join the meeting</a></p>
            <p>Thank you!</p>
        """
        send_email([candidate_email], candidate_subject, candidate_body)
 
        # Send email to the interviewers
        interviewer_subject = f'Interview Scheduled'
        interviewer_body = f"""
            <p>Hello Interviewer,</p>
            <p>You have an interview scheduled with {candidate_email}. Please join the meeting using the following Google Meet link: {google_meet_link} on {interview_time}</p>
            <br><br><br>               
            <a href="http://localhost:3000/feedback?jdId={jd_id}&candidateEmail={candidate_email}" target="_blank">
                <button style="background-color: #007BFF; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; cursor: pointer;">
                    Click here to enter feedback
                </button>
            </a>
            <br><br><br><br>
            <p>Thank you!</p>
        """
        send_email(interviewer_emails, interviewer_subject, interviewer_body)
        # Fetch candidate profile from the database
        candidate_profile = candidateprofiles.find_one({'jddetails_id': ObjectId(jd_id), 'candidateEmail': candidate_email})
        print("candidate profile:",candidate_profile)
    
        if candidate_profile:
      
            # Update candidate profile with the interview ID
            candidateprofiles.update_one(
                {'jddetails_id': ObjectId(jd_id), 'candidateEmail': candidate_email},
                {'$set': {'interviewid': inserted_id,'overallStatus': 'InterviewScheduled'}}
            )
            
        else:
            print("Candidate Profile not found in the database.")
 
        return jsonify({'message': 'Interview scheduled successfully'}), 200
 
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
    
    
def schedule_google_meet_direct( candidate_email, interview_time, manual_meet_link=None):

    try:
        if manual_meet_link:
            # Use the manually provided Meet link
            meet_link = google_meet_link
        else:
            credentials_meet = service_account.Credentials.from_service_account_file(
                SERVICE_ACCOUNT_FILE_MEET, scopes=SCOPES_MEET)
            service_meet = build('calendar', 'v3', credentials=credentials_meet)
 
            event = {
                'summary': f'Interview with {candidate_email}',
                'description': f'Interview with {candidate_email}',
                'start': {
                    'dateTime': interview_time.strftime('%Y-%m-%dT%H:%M:%S'),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': (interview_time + timedelta(minutes=60)).strftime('%Y-%m-%dT%H:%M:%S'),
                    'timeZone': 'UTC',
                },
                'conferenceData': {
                    'createRequest': {
                        'requestId': 'some-unique-id',
                    },
                },
            }
 
            event = service_meet.events().insert(calendarId=CALENDAR_ID, body=event, conferenceDataVersion=1).execute()
 
            conference_data = event.get('conferenceData', {})
            entry_points = conference_data.get('entryPoints', [])
 
 
        # Check if the candidate has joined
        if interview_time is not None:
            print("Condition met: Candidate has joined")
            email = candidate_email
            link = google_meet_link
 
        else:
            print("Condition not met: Candidate has not joined")
 
        return google_meet_link
 
    except Exception as e:
        raise e
 
 
 
def analyze_sentiment(feedback_text):

    # Specify the model and revision explicitly
    model_name = "distilbert/distilbert-base-uncased-finetuned-sst-2-english"
    revision = "af0f99b"

    # default,it was using distilbert-base-uncased-finetuned-sst-2-english  model .
    sentiment_pipeline = pipeline("sentiment-analysis", model=model_name, revision=revision)
 
    # Analyze the sentiment of the feedback text
    result = sentiment_pipeline(feedback_text)
    print('result:', result[0]['label'])

    interview_id = current_app.config.get('SHARED_INSERTEDID')
    print('interview_id:', interview_id)

    # interview_id = session.get('inserted_id')
    # print('interview_id:', interview_id)

    interview_id_object = ObjectId(interview_id)
    print("interviewid_object:",interview_id_object)
    
    
    # Update feedback_text field in the database
    candidateprofiles.update_one({'interviewid': interview_id_object},
                                   {'$set':  {'interviewStatus': result[0]['label']}})


    return result

 



@app.route('/feedback', methods=['POST'])
def feedback_form():
    try:
        data = request.json
        print("Received data:", data)
        
        jd_id = data.get('jdId')
        candidate_email = data.get('candidateEmail')
        feedback_text = data.get('feedback')
        areas_of_interest = data.get('areasOfInterest')
        areas_of_strength = data.get('areasOfStrength')
        technical_skills = data.get('technicalSkills')
        programming_rating = data.get('programmingRating')
        performance_rating = data.get('performanceRating')
        review_rating = data.get('reviewRating')
        communication_skills = data.get('communicationSkills')
        problem_solving_skills = data.get('problemSolvingSkills')
        suggestion = data.get('suggestion')

        if not feedback_text:
            return jsonify({'error': 'Feedback text is empty'}), 400

        # Update feedback data in the collection
        update_result = collection.update_many(
            {'jddetails_id': jd_id, 'candidate_email': candidate_email},
            {'$set': {
                'feedback_text': feedback_text,
                'areas_of_interest': areas_of_interest,
                'areas_of_strength': areas_of_strength,
                'technical_skills': technical_skills,
                'programming_rating': programming_rating,
                'performance_rating': performance_rating,
                'review_rating': review_rating,
                'communication_skills': communication_skills,
                'problem_solving_skills': problem_solving_skills,
                'suggestion': suggestion
            }}
        )

        if update_result.matched_count == 0:
            print(f"No documents matched")
            return jsonify({'error': 'No matching documents found'}), 404
        
        print(f"Matched {update_result.matched_count} documents and modified {update_result.modified_count} documents")

        # Analyze sentiment (ensure your `analyze_sentiment` function is defined)
        sentiment = analyze_sentiment([feedback_text])
        print("Sentiment:", sentiment)
        feedback_label = sentiment[0]['label']
        overall_status = 'InterviewScheduled'
        if feedback_label == 'POSITIVE':
            overall_status = 'Selected'
        else:
            overall_status = 'Rejected'

        # Update candidate profile
        update_result = candidateprofiles.update_one(
          {'jddetails_id': ObjectId(jd_id), 'candidateEmail': candidate_email},
            {'$set': {
                'overallStatus': overall_status,
                'interviewFeedback': {
                    'feedbackText': feedback_text,
                    'programmingRating': programming_rating,
                    'performanceRating': performance_rating,
                    'reviewRating': review_rating,
                    'communicationSkills': communication_skills,
                    'problemSolvingSkills': problem_solving_skills,
                    'areasOfInterest': areas_of_interest,
                    'areasOfStrength': areas_of_strength,
                    'suggestion': suggestion,
                    'technicalSkills': technical_skills
                }
            }}
        )

        if update_result.matched_count == 0:
            print(f"No documents matched for jdId: {jd_id} and candidateEmail: {candidate_email} in candidateprofiles")
            return jsonify({'error': 'No matching candidate profiles found'}), 404

        print(f"Matched {update_result.matched_count} candidate profiles and modified {update_result.modified_count} profiles")

        return jsonify({'message': 'Feedback submitted successfully'}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/sendEmail', methods=['POST'])
def send_email_api():
    try:
        data = request.get_json()
        candidate_emails = data.get('candidateEmail')
        print("candidate_emails:", candidate_emails)
        subject = data.get('subject')
        print("Received subject:", subject)
        body = data.get('body')
        print("Received body:", body)
 
 
        if not isinstance(candidate_emails, list):
            return jsonify({'error': 'Candidate emails must be provided as a list'}), 400
 
        for candidate_email in candidate_emails:
            print("candidate_email:", candidate_email)
            send_email([candidate_email], subject, body)
 
        return jsonify({'message': 'Emails sent successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
 


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0',port=3004)