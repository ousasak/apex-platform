# ===========================================
# Stage 1: Base (shared package files)
# ===========================================
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./

# ===========================================
# Stage 2: Development (docker-compose local)
# ===========================================
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# ===========================================
# Stage 3: Build (production bundle)
# ===========================================
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ===========================================
# Stage 4: Production (Nginx)
# ===========================================
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80 10000
CMD ["nginx", "-g", "daemon off;"]
