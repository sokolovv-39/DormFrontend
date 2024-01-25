FROM node:lts-alpine AS production
ENV NODE_ENV production
WORKDIR /app
COPY ./package.json ./
RUN npm install --verbose
COPY . .
RUN npm run build

FROM nginx
COPY --from=production /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf


