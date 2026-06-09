# build context: ai/ (deploy/ddasum-ai/docker-compose.yml)
FROM python:3.11-slim-bookworm
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*
COPY chatbot/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt pysqlite3-binary
COPY shared /app/shared
COPY chatbot/chatbot.py .
COPY chatbot/data ./data
ENV PYTHONPATH=/app/shared
ENV CHATBOT_PORT=8001
EXPOSE 8001
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:8001/health || exit 1
CMD ["python", "chatbot.py"]
