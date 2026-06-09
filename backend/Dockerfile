# ---- build ----
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY gradlew gradlew.bat settings.gradle build.gradle ./
COPY gradle gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies -q || true
COPY src src
# 비밀 없는 cloud 템플릿만 JAR에 포함 (실제 값은 Docker env)
RUN cp src/main/resources/application-cloud.yml.example src/main/resources/application-cloud.yml
RUN ./gradlew --no-daemon bootJar -x test

# ---- run ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN adduser -D -u 1000 appuser
COPY --from=build /app/build/libs/*-SNAPSHOT.jar /app/app.jar
RUN chown appuser:appuser /app/app.jar
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/swagger-ui.html || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
