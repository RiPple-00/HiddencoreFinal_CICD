# ---- build ----
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

COPY backend/gradlew backend/gradlew.bat backend/settings.gradle backend/build.gradle ./
COPY backend/gradle gradle

RUN chmod +x gradlew && ./gradlew --no-daemon dependencies -q || true

COPY backend/src src

# 비밀 없는 cloud 템플릿만 JAR에 포함
RUN cp src/main/resources/application-cloud.yml.example \
       src/main/resources/application-cloud.yml

RUN ./gradlew --no-daemon bootJar -x test


# ---- run ----
FROM eclipse-temurin:17-jre

USER root

# Python 설치
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-venv \
        libxcb1 \
        libglib2.0-0 \
        libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Face AI 전용 Python 가상환경
RUN python3 -m venv /opt/face-ai-venv

# Face AI requirements
COPY ai/dasum-face-ai-test/requirements.txt /tmp/face-ai-requirements.txt

RUN /opt/face-ai-venv/bin/pip install --no-cache-dir \
        -r /tmp/face-ai-requirements.txt

WORKDIR /app

RUN useradd -m appuser

COPY --from=build /app/build/libs/*-SNAPSHOT.jar /app/app.jar

RUN chown -R appuser:appuser /app /opt/face-ai-venv

# Backend가 Face AI 실행 시 사용할 Python
ENV PYTHON_EXECUTABLE=/opt/face-ai-venv/bin/python

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/swagger-ui.html || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
