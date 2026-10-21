# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first (cached layer)
COPY package.json package-lock.json ./

# Install exact dependency versions (ci = clean install)
# Note: yarn.lock is also present but we prefer npm ci for reproducibility in CI
RUN npm ci --legacy-peer-deps

# Copy remaining source
COPY . .

# Produce production build
# angular.json outputPath = "dist" (flat — browser builder, NOT @angular/build:application)
# Output lands at /app/dist/ (index.html + all JS/CSS/assets at the same level)
RUN npx ng build --configuration=production

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove the default nginx site config
RUN rm /etc/nginx/conf.d/default.conf

# SPA-friendly nginx config as a template: envsubst renders it into
# /etc/nginx/conf.d/default.conf at container start.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Backend target (host:port). docker-compose default; Render sets this via Blueprint fromService hostport.
ENV BACKEND_HOSTPORT=backend:8080

# Fail fast on Render if the API upstream was not wired (avoids silent 502 on login).
COPY render-check-backend.sh /docker-entrypoint.d/40-render-check-backend.sh
RUN chmod +x /docker-entrypoint.d/40-render-check-backend.sh

# Copy the compiled Angular application.
# angular.json: "outputPath": "dist"  →  files land in /app/dist/ (flat, no sub-folder)
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
