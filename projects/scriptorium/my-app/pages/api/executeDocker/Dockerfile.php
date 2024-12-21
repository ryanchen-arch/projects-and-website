# Use official PHP image
FROM php:8.0-cli

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the PHP code into the container as 'temp.php'
COPY temp.php .

# Command to run the PHP code
CMD ["php", "temp.php"]
