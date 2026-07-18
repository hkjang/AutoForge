FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
COPY assets ./assets
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production PORT=4174 AUTOFORGE_REQUIRE_AUTH=true AUTOFORGE_DATA_DIR=/var/lib/autoforge AUTOFORGE_ARTIFACT_DIR=/var/lib/autoforge/artifacts
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY server ./server
COPY openapi.yaml README.md ./
RUN addgroup -S autoforge && adduser -S autoforge -G autoforge && mkdir -p /var/lib/autoforge && chown -R autoforge:autoforge /app /var/lib/autoforge
USER autoforge
EXPOSE 4174
VOLUME ["/var/lib/autoforge"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:4174/api/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]
