# Start from a slim Python base image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /code

# Copy the requirements file and install dependencies
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the application code into the container
COPY ./app /code/app

# Command to run the application using uvicorn
# It will be available on port 8000 in the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]