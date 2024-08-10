import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
from pymongo import MongoClient
import spacy
from flask import Flask
from flask_cors import CORS
from Screeningtest import generate_token

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
 
# SMTP Email Configuration
SMTP_SERVER = "smtp.elasticemail.com"
SMTP_PORT = 2525
# SMTP_PASSWORD="10F9AE2E5D20E7F59CC93D8CC24DA4850A68"
# SMTP_USERNAME ="induerayadav@gmail.com"

#new credentails for free usage
SMTP_PASSWORD="7CC84F3872031F32975A12C5CA0FDEABEB9B"
SMTP_USERNAME ="indusri4517@gmail.com"
 


def send_email_to_candidate(email,token):
    try:
        # Your existing email sending code goes here
        smtp_server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        smtp_server.starttls()
        smtp_server.login(SMTP_USERNAME, SMTP_PASSWORD)

 
        script = """
<script>
    function handleResponse(response) {
        // Extract email and response from the URL
        const searchParams = new URLSearchParams(window.location.search);
        const email = searchParams.get('email');
        const userResponse = searchParams.get('response');
 
        // Make an AJAX request to your backend with the response and email
        fetch('http://127.0.0.1:5000/store-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                response: userResponse,
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('response-message').innerHTML = 'Thank you for your response!';
 
            // Check if the response is 'interested' to send screening questions
            if (userResponse === 'interested') {
              console.log("output")
                // Redirect to the login.html page
                window.location.href = 'http://127.0.0.1:5000/login';
                console.log("output:",userResponse)
            } else {
                  console.log("output userResponse")
                // Redirect to the thank.html page
                window.location.href = 'http://127.0.0.1:5000/thank';
            }
        })
        .catch(error => console.error('Error:', error));
    }
</script> 
            """
        
        subject = 'Congratulations!'
        body = f"""
    Congratulations! You have been selected for the next stage of the process in zentree labs.<br><br>

    Please respond with your interest:<br><br>
 
    <a href="http://127.0.0.1:5008/respond?email={email}&response=interested&token={token}" target="_blank" style="background-color: #007BFF; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Interested</a><br><br>
 
 
    <a href="http://127.0.0.1:5008/respond?email={email}&response=not_interested&token={token}" target="_blank" style="background-color: #007BFF; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Not Interested</a><br><br><br><br>
 
     <p><strong>Candidate Key: {token}</strong></p>
    <p style="color: #888888; font-size: 14px;">Note: Please submit your response within 48 hours.</p><br>

 
    {script}
"""
 
        for recipient_email in [email]:
            message = MIMEMultipart()
            message['From'] = SMTP_USERNAME
            message['To'] = recipient_email
            message['Subject'] = subject
            message.attach(MIMEText(body, 'html'))
 
            smtp_server.sendmail(SMTP_USERNAME, recipient_email, message.as_string())
 
        smtp_server.quit()
        print(f"Email sent successfully to {email}")
    except Exception as e:
        print(f"Error sending email:", e)
 
 