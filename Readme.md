# Real-Time Performance Monitoring and Data Visualization

## Overview

This project is a real-time performance monitoring system implemented in Node.js using Socket.io for real-time communication and MongoDB for data storage. It allows administrators to monitor the performance metrics of various machines in real-time.

## Features

- **Real-Time Monitoring**: The application provides real-time monitoring of performance metrics, including CPU usage, memory usage, and system information for multiple machines.

- **Clustered Architecture**: The application uses Node.js clustering to efficiently distribute incoming socket connections among multiple worker processes, ensuring scalability and high availability.

- **MongoDB Integration**: Machine performance data is stored in a MongoDB database, allowing for historical data analysis and reporting.

## Installation

1. Clone the repository:

   git clone this repo

2. Install dependencies:

   cd server
   npm install

3. Configure MongoDB:

   Ensure MongoDB is installed and running.
   Update the MongoDB connection URL in the server.js file to match your MongoDB server.

4. Start the application:

   npm start

## Technologies Used

    Node.js
    Socket.io
    MongoDB
    Express
    Mongoose (for MongoDB integration)

## License

    MIT
