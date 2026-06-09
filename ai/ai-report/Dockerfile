FROM python:3.11-slim-bookworm
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*
COPY ai-report/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY shared /app/shared
COPY ai-report/report_service.py .
ENV PYTHONPATH=/app/shared
ENV AI_REPORT_PORT=8002
EXPOSE 8002
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:8002/health || exit 1
CMD ["python", "report_service.py"]
