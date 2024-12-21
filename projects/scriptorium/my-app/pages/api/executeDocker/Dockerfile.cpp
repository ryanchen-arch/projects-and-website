# Use official GCC image (supports C++)
FROM gcc:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the C++ code into the container as 'temp.cpp'
COPY temp.cpp .

# Command to compile and run the C++ code
CMD ["sh", "-c", "g++ temp.cpp -o temp && ./temp"]
