# Use an official Python runtime as the base image
FROM python:3.10

# Set the working directory in the container to /app
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install spaCy model
RUN python -m spacy download en_core_web_sm

# Install additional system dependencies required by textract
RUN apt-get update && \
    apt-get install -y \
    poppler-utils \        
    tesseract-ocr \         
    libxslt-dev \           
    libxml2-dev \          
    libjpeg-dev \           
    zlib1g-dev \           
    antiword \              
    unrtf \                 
    zip \                  
    && rm -rf /var/lib/apt/lists/*

# Copy the src directory to /app/src
COPY ./src /app/src

# Copy other necessary directories
#COPY ./docs /app/docs

# Ensure the PYTHONPATH includes the /app directory
ENV PYTHONPATH="/app:${PYTHONPATH}"

# Set the working directory to /app/src/utils where api.py is located
WORKDIR /app/src/utils

# Expose any ports the app runs on
EXPOSE 5005

# Command to run the application
CMD ["python", "api.py"]
