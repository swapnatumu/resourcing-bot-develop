

from flask import Flask, request, jsonify,send_from_directory
import textract
import os
from flask_restful import Api
from flask_cors import CORS
from flask_mail import Mail, Message
 

from werkzeug.utils import secure_filename

from bson import ObjectId
from flask import url_for


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
api = Api(app)
 


UPLOAD_FOLDER = 'uploads'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'pdf'}




@app.route('/parseJDPDF', methods=['POST'])
def upload_file():
    # Check if a file is present in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    # Check if the file has a valid extension
    allowed_extensions = {'pdf', 'txt', 'docx', 'xlsx'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Unsupported file format'}), 400
 
    try:
        # Save the file temporarily
        file_path = 'temp_file' + os.path.splitext(file.filename)[1]
        file.save(file_path)
 
        # Extract text based on file type
        if file.filename.lower().endswith('.pdf'):
            text = textract.process(file_path, method='pdftotext').decode('utf-8')
        elif file.filename.lower().endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as txt_file:
                text = txt_file.read()
        elif file.filename.lower().endswith('.docx'):
            text = textract.process(file_path).decode('utf-8')
        elif file.filename.lower().endswith('.xlsx'):
            text = textract.process(file_path).decode('utf-8')
 
        # Delete the temporary file
        os.remove(file_path)
 
        # Return the extracted text as JSON response
        return jsonify({'text': text}), 200
 
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True,port=3003, host='0.0.0.0')
