# Use an official Python runtime as the base image
FROM python:3.10

# Set the working directory in the container
# WORKDIR /usr/src/app

# Copy requirements.txt to the container
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
# RUN pip install pymongo, flask

# Copy the rest of the application code to the container
COPY . .

# Expose any ports the app runs on
# (Not needed if the app only communicates via network)
EXPOSE 8081 3004 5002

# Command to run the application
CMD ["python3", "InterviewScheduling.py"]
