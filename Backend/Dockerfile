# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy dependency manifests first to leverage layer caching
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw mvnw.cmd ./

# Resolve all dependencies (cached layer – only invalidated when pom.xml changes)
RUN mvn dependency:go-offline -B -q

# Copy source and build the fat JAR, skipping tests
COPY src/ src/
RUN mvn clean package -DskipTests -B -q

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Install curl for the HEALTHCHECK
RUN apk add --no-cache curl

WORKDIR /app

# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the packaged JAR from the builder stage
COPY --from=builder /build/target/*.jar app.jar

# Own the workdir
RUN chown -R spring:spring /app
USER spring

EXPOSE 8080

# HEALTHCHECK: spring-boot-starter-actuator is NOT in pom.xml,
# so we probe /api/auth/register (always returns 4xx, never 404) as a liveness check.
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -sf -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/register \
      | grep -qE "^(200|400|401|403|405|422)$" || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
