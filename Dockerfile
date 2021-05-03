FROM node:14-alpine3.10
WORKDIR /home/jerome/WebstormProjects/node
COPY package*.json ./
RUN npm install
ENV PATH="/home/jerome/WebstormProjects/node:${PATH}"
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
