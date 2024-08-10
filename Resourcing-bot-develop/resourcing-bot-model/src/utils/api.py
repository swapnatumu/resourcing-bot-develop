from flask import Flask, request, jsonify, send_from_directory
from flask_restful import Api
from flask_cors import CORS
import sys
import os
import textract
from bson import ObjectId
import uuid 
import pandas as pd


 
 
# Get the current directory (assuming this code is in api.py)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Get the root directory by traversing up two levels
root_dir = os.path.dirname(os.path.dirname(current_dir))

# Get the absolute path of the src directory
src_dir = os.path.join(root_dir, 'src')

# Add the src directory to the Python path
sys.path.append(src_dir)
 

from src.models.model import extract_keywords, generate_summary, run_model
from src.models.MistralModel import fetch_resumes
from src.utils.getpdfs_api import process_pdf

 
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://10.10.1.46:3000"}})
api = Api(app)
 
 
@app.route('/extract_job_details_openai', methods=['POST'])
def extract_job_details_openai():
    data = request.get_json()
    print("data entered:",data)   
    job_description = data.get('job_description', '')

    print("job_description:",job_description)
    job_role = data.get('job_role')
    skills = data.get('skills')
    experience = data.get('experience')
 
    qualification, responsibilities = extract_keywords(job_description)
    response_data = run_model(job_role, skills, experience, qualification, responsibilities)
 
    document_summaries = generate_summary(response_data)
    print("document_summaries:",document_summaries)
 
    # document_summaries = [{'content': {'page_content': 'Anvesh Abbu (.Net Developer) \nEmail:  anveshabbu@gmail.com  \nPhone:  +91-8985792422 \n \n \n \nObjective  \nTo work with a creative  and continuous learning  environment  where  I can use my \nskills and knowledge towards the growth of organization and my career.  \nProfessional summary  \n\uf076 Around 4 years of Experience in applications performing Analysis, Design, \nDevelopment, Test and Support. \n\uf076 Experience  in supporting  the production  system  and handling  day to day issues.  \n\uf076 Experience with Full Software Development Life Cycle (SDLC) from inception to \ndelivery of product including requirements gathering, functional specification, \ndesign, estimation, implementation, debugging, documentation, Project Release \nand Production support.  \n\uf076 Extensi vely worked on client side as well server -side State Management \ntechniques.  \n\uf076 Experience  in data access  technologies  like  ENTITY  DATA  MODEL \n\uf076 Experience  in Three  tier and MVC architecture  \n\uf076 Having  Experience  in JQUERY  , JAVASCRIPT  and REACT  JS. \n\uf076 Finally  support  and maintenance  of the application  during production  phase.  \n\uf076 Ability to learn new concepts and Good communication, inter -personal skills, \nready to work in any environment.  \n \nProfessional  Experience  \n\uf0d8 Worked  as Intern  in Appsron  Infotech  Pvt Ltd., Hyderabad  March  2019-Aug \n2019\uf020\n\uf0d8 Worked  as trainee  software  engineer  in Appsron  Infotech  Pvt Ltd., Hyderabad \nAug 2019 - September 2020. \uf020\n\uf0d8 Working  as software  engineer  in KireetiSoft Technologies  Ltd., Hyderabad \nSeptember 2020 to till Date. \uf020', 'metadata': {'source': '/home/dlakshmi/Documents/ResourcingBot/ResourcingBot_Model_Summarygeneration/docs/AnveshabbuResume.pdf', 'page': 0}, 'extracted_email': 'anveshabbu@gmail.com', 'extracted_phone_number': '8985792422', 'extracted_name': 'Anvesh Abbu'}}]
    return {"document_summaries":document_summaries}
 
@app.route('/extract_job_details', methods=['POST'])
def extract_job_details():
    data = request.get_json()
    print("data entered:",data)   
    job_description = data.get('job_description', '')
    print("job_description:",job_description)

    resume_path = os.getenv('RESUME_PATH') 
    print("resume_path:",resume_path)

    document_summaries = fetch_resumes(job_description, resume_path)

    # document_summaries = [
    #     {
    #         "Resume": "AchalResume.pdf",
    #         "Summary": "Based on the candidate's resume, their major skills include deep learning frameworks such as PyTorch, Keras, Tensorflow, langchain, numpy, and pandas. They have experience with deep learning architectures like CNNs, GCNs, Transformers, BERT, LLMs, and are proficient in programming languages like Python, C, C++, JavaScript, and Git. They have expertise in algorithm development, data structures, and coding proficiency in C/C++ or Python. Their experience spans across various projects in Computer Vision, NLP, and Deep Learning models, with proficiency in major deep learning frameworks such as PyTorch and TensorFlow. They have experience in deep learning model training and inference, and knowledge of quantization of deep learning models is an added advantage."
    #     },
    #     {
    #         "Resume": "ShriramResume.pdf",
    #         "Summary": "Based on the candidate's resume, their major skills include:1. Automation scripting using languages like Groovy, Python, PowerShell, and Bash.2. Hands-on experience with Configuration Management, Continuous Integration, Continuous Deployment, Release Management, and Cloud Implementations.3. Experience with Terraform and Ansible for cloud infrastructure provisioning, automation, and configuration management.4. Container orchestration using Docker and Kubernetes.5. Version control tool experience with Git and GitHub.6. Familiarity with Azure DevOps and Azure services like App Service, MariaDB, AzureAD Connect, AzureAD Connect health, and Microsoft Azure Active Directory.7. Knowledge of Continuous Integration and associated tools like Maven, Jenkins.8. Analysis of source code using Sonarqube.9. Experience in Google Cloud Platform (GCP) Services like Compute Engine, Cloud Storage, DOC AI, Vertex AI, Networking, CICD/Cloud build, GCR, Artifact Registry, GKE, Cloud SQL, Cloud Composer, Cloud Shell/Editor, Big Query.10. DevOps tools such as Agile, Git, GitHub, Jenkins, Ansible, Docker, Kubernetes, Terraform, Helm Charts.11. Scripting and programming languages like Python, Shell, Bash, and database experience with SQL and MySQL.12. Strong experience in Kubernetes cluster setup and deploying applications in Kubernetes clusters.13. Experience in configuring industry-leading infrastructure/application monitoring tools like Kibana, Grafana, and NewRelic.14. Proficiency in mathematical algorithms, numerical analysis, and matrix methods.15. Knowledge of CUDA, Tensor RT, and TVM is a plus.Based on the job description, the candidate should have a degree in Computer Science, ECE, EEE, or a related technical field. They must have strong skills in algorithm development, data structures, and coding proficiency in C/C++ or Python. Experience in Computer Vision, NLP, and Deep Learning models is essential, with proficiency in major deep learning frameworks such as PyTorch and TensorFlow. Hands-on experience with deep learning models like CNN and RNN is preferred, as well as experience in deep learning model training and inference. Knowledge of quantization of deep learning models is an added advantage. Proficiency in mathematical algorithms, numerical analysis, and matrix methods is desired, and knowledge of CUDA, Tensor RT, and TVM is a plus."
    #     }
    # ]

    print("document_summaries:", document_summaries)
    try:
        if document_summaries is not None:
        # Iterate over the document summaries
            for doc_summary in document_summaries:
                # Process each document to extract information
                result = process_pdf(doc_summary["Resume"])
                
                # Update the document summary with extracted information
                doc_summary["extracted_email"] = result.get('extracted_email', None)
                doc_summary["extracted_phone_number"] = result.get('extracted_phone_number', None)
                doc_summary["extracted_name"] = result.get('extracted_name', None)
        else:
                print("Error: document_summaries is None")
    except Exception as e:
        print("An error occurred:", e)
       
 
    # document_summaries = [{'content': {'page_content': 'Anvesh Abbu (.Net Developer) \nEmail:  anveshabbu@gmail.com  \nPhone:  +91-8985792422 \n \n \n \nObjective  \nTo work with a creative  and continuous learning  environment  where  I can use my \nskills and knowledge towards the growth of organization and my career.  \nProfessional summary  \n\uf076 Around 4 years of Experience in applications performing Analysis, Design, \nDevelopment, Test and Support. \n\uf076 Experience  in supporting  the production  system  and handling  day to day issues.  \n\uf076 Experience with Full Software Development Life Cycle (SDLC) from inception to \ndelivery of product including requirements gathering, functional specification, \ndesign, estimation, implementation, debugging, documentation, Project Release \nand Production support.  \n\uf076 Extensi vely worked on client side as well server -side State Management \ntechniques.  \n\uf076 Experience  in data access  technologies  like  ENTITY  DATA  MODEL \n\uf076 Experience  in Three  tier and MVC architecture  \n\uf076 Having  Experience  in JQUERY  , JAVASCRIPT  and REACT  JS. \n\uf076 Finally  support  and maintenance  of the application  during production  phase.  \n\uf076 Ability to learn new concepts and Good communication, inter -personal skills, \nready to work in any environment.  \n \nProfessional  Experience  \n\uf0d8 Worked  as Intern  in Appsron  Infotech  Pvt Ltd., Hyderabad  March  2019-Aug \n2019\uf020\n\uf0d8 Worked  as trainee  software  engineer  in Appsron  Infotech  Pvt Ltd., Hyderabad \nAug 2019 - September 2020. \uf020\n\uf0d8 Working  as software  engineer  in KireetiSoft Technologies  Ltd., Hyderabad \nSeptember 2020 to till Date. \uf020', 'metadata': {'source': '/home/dlakshmi/Documents/ResourcingBot/ResourcingBot_Model_Summarygeneration/docs/AnveshabbuResume.pdf', 'page': 0}, 'extracted_email': 'anveshabbu@gmail.com', 'extracted_phone_number': '8985792422', 'extracted_name': 'Anvesh Abbu'}}]
    return {"document_summaries":document_summaries}
 

UPLOAD_FOLDER = 'uploads'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
    
    file_path = 'temp_file' + os.path.splitext(file.filename)[1]

    try:
         # Save the file temporarily
       
        file.save(file_path)

        # Extract text based on file type
        text = ''
        if file.filename.lower().endswith('.pdf'):           
                text = textract.process(file_path, method='pdftotext').decode('utf-8')             
        elif file.filename.lower().endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as txt_file:
                text = txt_file.read()
        elif file.filename.lower().endswith('.docx'):
            text = textract.process(file_path).decode('utf-8')
        elif file.filename.lower().endswith('.xlsx'):
            # You might want to use a different library for .xlsx files
           
            xlsx_data = pd.read_excel(file_path)
            text = xlsx_data.to_string()

        # Delete the temporary file
        os.remove(file_path)

        # Return the extracted text as JSON response
        return jsonify({'text': text}), 200
    except Exception as e:
        # Return the error message
        print("Exception....", e)
        return jsonify({'error': str(e)}), 500


        
@app.route('/get_pdf', methods=['GET'])
def get_pdf_with_email():
    fileName = request.args.get('fileName')
    print("fileName:", fileName)
    if fileName:
         # Get the directory of the current script
        script_dir = os.path.dirname(os.path.abspath(__file__))       
        # Construct the path to the `docs` folder, which is at the same level as `src`
        docs_dir = os.path.join(script_dir, '..', '..', 'docs')
        # Normalize the path
        docs_dir = os.path.normpath(docs_dir)             
       
        response = send_from_directory(docs_dir, fileName, as_attachment=False)      
       
        print("response:", response)
        
        return response
    else:
        return jsonify({"error": "Source path not provided"})

if __name__ == '__main__':
    app.run(debug=True, port=5005, host='0.0.0.0')
 
