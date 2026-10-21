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

EXPOSE 8080 10000

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-XX:+UseSerialGC", "-Xss512k", "-XX:TieredStopAtLevel=1", "-jar", "app.jar"]
