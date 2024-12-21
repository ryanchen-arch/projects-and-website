# Use official Ruby image
FROM ruby:3.0-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the Ruby code into the container as 'temp.rb'
COPY temp.rb .

# Command to run the Ruby code
CMD ["ruby", "temp.rb"]
