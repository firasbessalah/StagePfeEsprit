# ── Stage 1: Build – install dependencies into a venv ─────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build tools and create a virtual environment
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/* \
    && python -m venv /opt/venv

# Activate the venv for subsequent RUN steps
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Set HF_HOME so models are downloaded to a location we can mount as a volume
ENV HF_HOME=/app/models

# Create a non-root user
RUN addgroup --system aiuser && adduser --system --ingroup aiuser aiuser

# Copy the pre-built venv from the builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application source
# NOTE: The .env file is intentionally NOT copied; GEMINI_API_KEY must be
# supplied via docker-compose environment / secrets at runtime.
COPY main.py local_fraud_detector.py ./

RUN mkdir -p /app/models && chown -R aiuser:aiuser /app
USER aiuser

EXPOSE 8000

# Health check using the /health endpoint defined in main.py
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Entry point: uvicorn main:app (file=main.py, FastAPI instance variable=app)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
