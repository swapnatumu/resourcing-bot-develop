
import spacy
from spacy.matcher import Matcher
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import fitz 
import re

# Example usage
from langchain_core.documents.base import Document




app = Flask(__name__)
CORS(app, expose_headers=['extractedemail', 'extractedphonenumber','extractedname']) 
def extract_name(resume_text):
    nlp = spacy.load('en_core_web_sm')
    matcher = Matcher(nlp.vocab)

    # Define name patterns
    patterns = [
        [{'POS': 'PROPN'}, {'POS': 'PROPN'}],  # First name and Last name
        [{'POS': 'PROPN'}, {'POS': 'PROPN'}, {'POS': 'PROPN'}],  # First name, Middle name, and Last name
        [{'POS': 'PROPN'}, {'POS': 'PROPN'}, {'POS': 'PROPN'}, {'POS': 'PROPN'}]  # First name, Middle name, Middle name, and Last name
    ]

    for pattern in patterns:
        matcher.add('NAME', patterns=[pattern])

    doc = nlp(resume_text)
    matches = matcher(doc)

    for match_id, start, end in matches:
        span = doc[start:end]
        return span.text

    return None
            
def extract_email_from_text(text):
    email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    matches = re.findall(email_regex, text)
    return matches[0] if matches else None
def extract_phone_number_from_text(text):
    phone_regex = r'(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})'
    matches = re.findall(phone_regex, text)
    return matches[0] if matches else None
def extract_email_and_phone_number_from_pdf(pdf_path):
    try:
        with fitz.open(pdf_path) as pdf_document:
            text = ""
            for page_number in range(pdf_document.page_count):
                page = pdf_document[page_number]
                text += page.get_text()
            # Extract email,phone number and name from the PDF text
            extracted_email = extract_email_from_text(text)
            extracted_phone_number = extract_phone_number_from_text(text)
            extracted_name = extract_name(text)
            return extracted_email, extracted_phone_number, extracted_name
    except Exception as e:
        print(f"Error extracting email, phone number, and name from PDF: {e}")
        return None, None, None

def process_pdf(source_path):
    
   # Ensure the input is a Document instance
    if isinstance(source_path, Document):
        # Access page_content and metadata from the Document
        page_content = source_path.page_content
        metadata = source_path.metadata
        source = metadata.get('source', 'Source not found')
        filename = source.split("/")[-1]     
    else:
        filename = source_path

        # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))       
    # Construct the path to the `docs` folder, which is at the same level as `src`
    docs_dir = os.path.join(script_dir, '..', '..', 'docs')
    # Normalize the path
    docs_dir = os.path.normpath(docs_dir)   
            
    # Extract email, phone number, and name from the PDF
    extracted_email, extracted_phone_number, extracted_name = extract_email_and_phone_number_from_pdf(docs_dir+"/" +filename)
    
    # Prepare the response data
    response_data = {
        'extracted_email': extracted_email,
        'extracted_phone_number': extracted_phone_number,
        'extracted_name': extracted_name
    }
    print("Response data:", response_data)
    
    return response_data
   
  