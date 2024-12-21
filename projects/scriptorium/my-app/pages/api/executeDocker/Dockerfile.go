# Use official Go image
FROM golang:1.20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the Go code into the container as 'temp.go'
COPY temp.go .

# Command to build and run the Go code
CMD ["go", "run", "temp.go"]
