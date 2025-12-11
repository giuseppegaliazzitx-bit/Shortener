FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY Backend/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY Backend/ .

EXPOSE 8000

CMD ["npm", "start"]
