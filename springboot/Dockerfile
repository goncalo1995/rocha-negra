# Use a lean, official Java 17 base image
FROM eclipse-temurin:17-jdk-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper and pom.xml to leverage Docker layer caching
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy the rest of the application source code
COPY src ./src

# Build the application into a .jar file
RUN ./mvnw package -DskipTests

# Expose the port the application will run on
EXPOSE 8080

# The command to run the application
CMD ["java", "-jar", "target/api-0.0.1-SNAPSHOT.jar"]

#
# # --- Stage 1: The Build Stage ---
# # Use the official Maven image which contains the JDK and Maven
# FROM maven:3.8-eclipse-temurin-17 AS build

# # Set the working directory
# WORKDIR /app

# # Copy the pom.xml and download dependencies first to leverage Docker cache
# COPY pom.xml .
# RUN mvn dependency:go-offline

# # Copy the rest of the source code
# COPY src ./src

# # Build the application, creating the .jar file
# RUN mvn package -DskipTests

# # --- Stage 2: The Final, Lean Production Stage ---
# # Start from a lean JRE image, which is smaller than a full JDK image
# FROM eclipse-temurin:17-jre-jammy

# WORKDIR /app

# # Copy ONLY the .jar file from the 'build' stage
# COPY --from=build /app/target/*.jar app.jar

# EXPOSE 8080

# # The command to run the application
# CMD ["java", "-jar", "app.jar"]