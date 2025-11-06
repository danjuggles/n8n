FROM mcr.microsoft.com/playwright:v1.56.1-jammy

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --omit=dev

# App code
COPY signer.js sign.js server.js ./

# Run as non-root
USER pwuser

# HTTP microservice defaults (for n8n HTTP Request node)
EXPOSE 3000
CMD ["node", "server.js"]
