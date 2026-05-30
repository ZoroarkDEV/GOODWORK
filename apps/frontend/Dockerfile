FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (for layer caching)
COPY package*.json ./
RUN npm install

# Copy source code (including .env)
COPY . .

# Build the application
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]