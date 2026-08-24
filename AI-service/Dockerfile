FROM python:3.9-slim

RUN apt-get update && apt-get install -y libgomp1 wget && rm -rf /var/lib/apt/lists/*
 
WORKDIR /app
 
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Create models directory and download the model
RUN mkdir -p models && \
    wget -O models/qwen2.5-0.5b-instruct-q5_0.gguf https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q5_0.gguf

# Copy the rest of the application
COPY . .
# Launch uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]