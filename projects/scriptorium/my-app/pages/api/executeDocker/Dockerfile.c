# Use official GCC image
FROM gcc:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the C code into the container as 'temp.c'
COPY temp.c .

# Command to compile and run the C code
CMD ["sh", "-c", "gcc temp.c -o temp && ./temp"]
