from langchain.llms import OpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.document_loaders import PyPDFLoader
from langchain.vectorstores import FAISS
from langchain.text_splitter import CharacterTextSplitter

# from langchain_community.llms import OpenAI
# from langchain_community.embeddings.openai import OpenAIEmbeddings
# from langchain_community.document_loaders import PyPDFLoader
# from langchain_community.vectorstores import FAISS
# from langchain.text_splitter import CharacterTextSplitter

import os


# Load environment variables from a .env file
from dotenv import load_dotenv
load_dotenv(verbose=True)

# Get the absolute path to the directory of the current script
current_directory = os.path.dirname(os.path.abspath(__file__))

# Navigate up one directory to reach the parent directory
parent_directory = os.path.dirname(current_directory)   
grandparent_directory = os.path.dirname(parent_directory)

# Construct the path to the docs directory
documents_directory = os.path.join(grandparent_directory, 'docs')

embeddings = OpenAIEmbeddings()
current_dir = os.path.dirname(os.path.abspath(__file__))
docs_dir = os.path.join(current_dir, '..', 'docs')

# documents_directory = "/home/indhu/Desktop/Resourcing-bot/resourcing-bot-model/docs"
documents_directory =docs_dir
print("documents_directory:", documents_directory)

# # Ingesting logic, uncomment in the first run

# i=0

# for filename in os.listdir(documents_directory):
#     # file_path = (documents_directory +"/" +  filename)
#     file_path = os.path.join(documents_directory, filename)
#     loader = PyPDFLoader(file_path)
#     pages = loader.load_and_split()
#     text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
#     docs = text_splitter.split_documents(pages)
#     if(i==0):
#         db = FAISS.from_documents(documents=docs, embedding=embeddings)
#         db.save_local("faiss_index")
    
#     if(i!=0):
#         print('in 2')
#         # existing_db=FAISS.load_local("faiss_index", embeddings)
#         existing_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)

#         db=FAISS.from_documents(documents=docs, embedding=embeddings)
#         # db.merge_from(existing_db)
#         db.save_local("faiss_index")
#     i+=1


