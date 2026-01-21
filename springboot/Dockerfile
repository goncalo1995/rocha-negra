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