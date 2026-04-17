FROM node:20-alpine

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Source
COPY . .

# Railway avtomatik PORT o'rnatadi
EXPOSE 3000

CMD ["node", "src/index.js"]
