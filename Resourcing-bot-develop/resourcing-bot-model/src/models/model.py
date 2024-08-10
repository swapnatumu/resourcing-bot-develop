

from dotenv import load_dotenv

from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OpenAIEmbeddings

import json
from flask import Flask, request, jsonify
from flask_restful import Api
from flask_cors import CORS
import re
import os
import sys
from langchain_core.documents.base import Document

# Add the parent directory of `src` to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
# Now you can import `getpdfs_api` from `utils`
from src.utils.getpdfs_api import process_pdf



app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
api = Api(app)
 
# Load environment variables
load_dotenv(verbose=True)
 

# Initialize components
embeddings = OpenAIEmbeddings()

# Get the current script's directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the absolute path to the faiss_index directory
faiss_index_path = os.path.join(current_dir, '..', 'utils', 'faiss_index')

# Ensure the path is absolute
faiss_index_path = os.path.abspath(faiss_index_path)

# Load the FAISS index
new_db = FAISS.load_local(faiss_index_path, embeddings, allow_dangerous_deserialization=True)

llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
 
def run_model(job_role, skills,  experience, qualification, responsibilities):
 
    print ("Running model")
    CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template("""Retrieving PDFs for the given job description...
                                                             """)  # Modify as needed
 
    qa = ConversationalRetrievalChain.from_llm(llm=llm,
                                                retriever=new_db.as_retriever(search_type="similarity"),
                                                condense_question_prompt=CONDENSE_QUESTION_PROMPT,
                                                return_source_documents=True,
                                                verbose=False)
 
    chat_history = []
    
 
    docs = qa.invoke({'chat_history': chat_history, 'question': f"{job_role} {skills}  {experience} {qualification} {responsibilities} "})
    # print ("docs:", docs)
    document_info_list = []

    for doc in docs["source_documents"]:
        # Ensure doc is of Document type
        if isinstance(doc, Document):
            # Process the PDF
            result = process_pdf(doc)
            
            # Append document information
            document_info_list.append({
                "page_content": doc.page_content if doc else None,
                "metadata": doc.metadata if doc else None,
                "extracted_email": result.get('extracted_email', None),

                "extracted_phone_number": result.get('extracted_phone_number', None),

                "extracted_name": result.get('extracted_name', None)
            })
    response_data = {"documents": document_info_list}
     

    return response_data
 
 
 
def generate_summary(responsedata):
    print("response data entering into summary:", responsedata)
    llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
 
    document_summaries = []
 
    for document_info in responsedata["documents"]:
        document_content = document_info["page_content"]
        prompt = PromptTemplate.from_template(
            f"""Summarize the provided text:\n{document_content}\n\nPlease provide a concise summary (2-3 sentences) highlighting the key skills and experience mentioned."""
        )
        summary_text = f"{prompt}"
 
        summary_output = llm.predict(text=summary_text)
        print("summmary output:", summary_output)
 
        # Append the document content and its summary to the list
        document_summary = {
            "content": document_info,
            "summary": summary_output
        }

        document_summaries.append(document_summary)
 
    return document_summaries
 
 
 
def extract_keywords(job_description):
    llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
    prompt_text = PromptTemplate.from_template("""Summarize the provided text as a dictionary containing "job_role", a list of "primaryskills","secondaryskills", "experience" (years if possible),  "qualification", and "responsibilities" based on keywords associated with job descriptions""")
    text = f"{prompt_text}\n\n{job_description}"
    output = llm.predict(text=text) 

    print("Model output:", output)  

    if not output:
        raise ValueError("The output from the model is empty or None.")

    # Check if "output_variables=" is in the output string
    if "output_variables=" in output:
        # Extract the dictionary part from the output string
        output_dict_str = output.split("output_variables=")[1]

        # Replace single quotes with double quotes
        output_dict_str = re.sub(r"'([^']*)'", r'"\1"', output_dict_str)
        output_dict_str = re.sub(r'"(.*?)Bachelor\'s(.*?)"', r'"Bachelor\'s\1"', output_dict_str)
        output_dict_str = re.sub(r'"(.*?)Master\'s(.*?)"', r'"Master\'s\1"', output_dict_str)

        # Parse the string into a dictionary
        try:
            output_dict = json.loads(output_dict_str)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            print(f"Invalid JSON string: {output_dict_str}")
            raise

        return output_dict['qualification'], output_dict['responsibilities']

    else:
        try:
            output_dict = json.loads(output)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            print(f"Invalid JSON string: {output}")
            raise

        return output_dict['qualification'], output_dict['responsibilities']

