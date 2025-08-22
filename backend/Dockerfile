FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements/base.txt requirements/production.txt ./requirements/
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements/production.txt

# Copy application
COPY . .

# Create uploads directory
RUN mkdir -p static/uploads

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 8000

# Run application
CMD ["./start.sh"]
