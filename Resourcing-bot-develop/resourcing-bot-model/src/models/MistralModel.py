import argparse
import pypdf
from pypdf import PdfReader
import os
import csv
from docx import Document
import torch
import transformers
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig
from transformers import AutoTokenizer, AutoModel
from torch import Tensor


def load_pdf_files(folder_path):
    return sorted([os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.endswith('.pdf')])
 
# Function to load DOCX files from a folder
def load_docx_files(folder_path):
    return [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.endswith('.docx')]

# Function to extract data from a .docx file
def extract_text_from_docx(file_path):
    doc = Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)

    return '\n'.join(full_text)
 
# Function to extract text from a .pdf file
def extract_text_from_pdf(file_path):

    reader = PdfReader(file_path)
    full_text = []
    for page in reader.pages:
        full_text.append(page.extract_text())

    return '\n'.join(full_text)
 
# Function to load all the resume files and return a list which contains the path of every resume file.
def load_resume_files(folder_path):

    pdf_files = load_pdf_files(folder_path)
    docx_files = load_docx_files(folder_path)

    return pdf_files + docx_files

# Function for formatting the Jd prompt
def jd_format(job_description, jd_sys_prompt, jd_user_prompt):

    prefix = ""
    suffix = "\n"
    sys_format = prefix + "system\n" + jd_sys_prompt + suffix
    user_format = prefix + "user\n" + jd_user_prompt +"\nJob Description:\n" + job_description + suffix
    assistant_format = prefix + "assistant\n"
    prompt = sys_format + user_format + assistant_format
    return prompt


# Function for formatting the resume prompt
def resume_format(resume_text, res_sys_prompt, res_user_prompt, jd_summary):
    
    prefix = ""
    suffix = "\n"
    sys_format = prefix + "system\n" + res_sys_prompt + suffix
    user_format = prefix + "user\n" + res_user_prompt + "\nResume:\n" + resume_text + "\nJob Description:\n" + jd_summary + suffix
    assistant_format = prefix + "assistant\n"
    prompt = sys_format + user_format + assistant_format
    
    return prompt


# Function for calculating cosine similarity between Jd_summary and resume_summary
def cosine_similarity_compute(jd_summary, resume_summary, cosine_similarity_model, cosine_similarity_tokenizer):
    
    def last_token_pool(last_hidden_states: Tensor,
                     attention_mask: Tensor) -> Tensor:
        left_padding = (attention_mask[:, -1].sum() == attention_mask.shape[0])
        if left_padding:
            return last_hidden_states[:, -1]
        else:
            sequence_lengths = attention_mask.sum(dim=1) - 1
            batch_size = last_hidden_states.shape[0]
            return last_hidden_states[torch.arange(batch_size, device=last_hidden_states.device), sequence_lengths]



    jd_tokens =  cosine_similarity_tokenizer(jd_summary, max_length= 4096, padding=True, truncation=True, return_tensors="pt")
    resume_tokens = cosine_similarity_tokenizer(resume_summary, max_length=4096, padding=True, truncation=True, return_tensors="pt")
    
    jd_outputs = cosine_similarity_model(**jd_tokens)
    resume_outputs = cosine_similarity_model(**resume_tokens) 
    jd_embeddings = last_token_pool(jd_outputs.last_hidden_state, jd_tokens['attention_mask'])
    resume_embeddings = last_token_pool(resume_outputs.last_hidden_state, resume_tokens['attention_mask'])


    # normalize embeddings
    jd_embeddings = F.normalize(jd_embeddings)
    resume_embeddings = F.normalize(resume_embeddings)

    scores = (jd_embeddings @ resume_embeddings.T) * 100
    return scores.tolist()[0][0]
    

def generate_summary(prompt, summarization_tokenizer, summarization_model):
    
    inputs = summarization_tokenizer(prompt, return_tensors="pt", return_attention_mask=True)
    length = inputs['input_ids'].size(1)   # Get the length of the input_ids tensor (number of tokens in the sequence)
    
    if length > 4097:
        max_length = 4096
        
        # Clip the input_ids and attention_mask to the maximum length
        inputs['input_ids'] = inputs['input_ids'][:, :max_length]
        inputs['attention_mask'] = inputs['attention_mask'][:, :max_length]
    
    generation_config = GenerationConfig(
                            max_length=8192, 
                            temperature=0.01, 
                            top_p=0.95,
                            repetition_penalty=1.0,
                            do_sample=True, 
                            use_cache=True,
                            eos_token_id=summarization_tokenizer.eos_token_id,
                            pad_token_id=summarization_tokenizer.eos_token_id,
                            transformers_version="4.34.0.dev0")
    
    outputs = summarization_model.generate(**inputs, generation_config=generation_config)
    
    text = summarization_tokenizer.batch_decode(outputs)[0]
    start_index = text.find("assistant") + len("assistant") 
    text = text[start_index:]    
    end_index = text.rfind("<|im_end|>")
    text = text[:end_index]

    line = text.replace('\n','')    # removing the "\n" from the output.
    output = line.replace('\t','')  # removing the "\t" from the output.
    
    return output



def fetch_resumes(jd_text: str, resume_path: str): 
    
    summarization_model = AutoModelForCausalLM.from_pretrained("Open-Orca/Mistral-7B-OpenOrca", device_map="balanced")    
    summarization_tokenizer = AutoTokenizer.from_pretrained("Open-Orca/Mistral-7B-OpenOrca")
   

    cosine_similarity_model = AutoModel.from_pretrained("Salesforce/SFR-Embedding-Mistral", device_map="balanced").half()
    cosine_similarity_tokenizer = AutoTokenizer.from_pretrained("Salesforce/SFR-Embedding-Mistral")

    # system and user prompt to generate resume summary
    res_sys_prompt = """You are an AI Assistant. You will be given two inputs, One input candidate resume and other input details of job description"""
 
    res_user_prompt = """  1. Based on the candidate's resume, identify the major skills from their latest projects. 

                  2. Summarize breifly candidate resume based on the skills mentioned in the job description  """
 

    # system and user prompt to generate jd summary
    jd_sys_prompt = """You are an AI Assistant. You will be given input which contains the details of job description"""

    jd_user_prompt = """ Summarize job description by focuses on the skills, technologies, experiences and responsibilities one should posses"""

    jd_prompt = jd_format(jd_text, jd_sys_prompt, jd_user_prompt)
    jd_summary = generate_summary(jd_prompt, summarization_tokenizer, summarization_model)
             
    resume_paths = load_resume_files(resume_path)  # loading all the paths of the resume in a list
    resume_paths = sorted(resume_paths)
    
    my_list=[]      # it is a list of dictionaries, each dictionary contains resume folder name, generated resume summary, and cosine similarity. 
    
    for resume in resume_paths:
        outputs1={}
        print("Processing resume..",resume)
        if resume.endswith('.docx'):
            resume_text = extract_text_from_docx(resume)
        elif resume.endswith('.pdf'):
            resume_text = extract_text_from_pdf(resume)
        else:
            raise ValueError("Unsupported file format")
                      
        index = resume.rfind('/')+len('/')
        pdf_path = resume[index:]  # name of the resume file
	
        resume_prompt = resume_format(resume_text, res_sys_prompt, res_user_prompt, jd_summary)
        resume_summary = generate_summary(resume_prompt, summarization_tokenizer, summarization_model)
        cosine_similarity_score = cosine_similarity_compute(jd_summary, resume_summary, cosine_similarity_model, cosine_similarity_tokenizer)
        
        if cosine_similarity_score >= 70:
            outputs1['Resume'] = pdf_path   # Storing the Resume pdf file name in the dictionary.
            outputs1['Summary'] = resume_summary    # Storing the generated summary of the given resume in the dictionary. 
            outputs1['Cosine_Similarity'] = cosine_similarity_score
            my_list.append(outputs1) # Adding each resume summary and cosine similarity in the my_list

    summaries = sorted(my_list, key=lambda x: x['Cosine_Similarity'], reverse=True)  # it contains the final top 10 resume summaries with their scores.
    
    top_10_summaries = summaries[:10]   
    
    filtered_summaries = [{'Resume': item['Resume'], 'Summary': item['Summary']} for item in top_10_summaries]  # final list of dictionaries with person's name and their resume summary
    return filtered_summaries

 
