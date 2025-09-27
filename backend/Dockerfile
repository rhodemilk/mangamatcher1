FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (if ever needed) and clean up afterwards
RUN apt-get update \ 
    && apt-get install -y --no-install-recommends gcc \ 
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY entrypoint.sh /entrypoint.sh
# Normalize line endings to LF in case file has CRLF on Windows host
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 5000

# Use explicit shell interpreter to avoid exec errors on scripts with odd shebangs
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]

