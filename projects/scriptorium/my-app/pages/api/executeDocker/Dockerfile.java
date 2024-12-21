# Use OpenJDK as the base image
FROM openjdk:11-jdk

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the Java code into the container
COPY temp.java .

# Compile and run the Java code
CMD ["sh", "-c", "javac temp.java && java code"]
