# ---- build ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# API 경로는 코드에서 /api/... 사용 — baseURL은 빈 문자열(같은 도메인 Nginx 프록시)
ARG EXPO_PUBLIC_CHATBOT_URL=/chatbot
ENV EXPO_PUBLIC_CHATBOT_URL=${EXPO_PUBLIC_CHATBOT_URL}

RUN npm run build:web

# ---- run ----
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
