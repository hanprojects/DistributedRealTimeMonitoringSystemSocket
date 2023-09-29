const cluster = require('cluster');
const http = require('http');
const { Server } = require('socket.io');
const numCPUs = require('os').cpus().length;
const { setupMaster, setupWorker } = require('@socket.io/sticky');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');
const mongoose = require('mongoose');
const express = require('express'); // Added for Express

const port = 8181;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  const httpServer = http.createServer();

  // Setup sticky sessions
  setupMaster(httpServer, {
    loadBalancingMethod: 'least-connection',
  });

  // Setup connections between the workers
  setupPrimary();

  // Needed for packets containing buffers (you can ignore it if you only send plaintext objects)
  cluster.setupMaster({
    serialization: 'advanced',
  });

  httpServer.listen(port);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const httpServer = http.createServer();
  const io = new Server(httpServer);

  // Use the cluster adapter
  io.adapter(createAdapter());

  // Setup connection with the primary process
  setupWorker(io);

  io.on('connection', (socket) => {
    // Delegate socket handling to the socketMain function
    socketMain(io, socket);

    // Log the worker ID and connection
    console.log(`Connected to worker: ${cluster.worker.id}`);
  });

  // Listen on an available port
  httpServer.listen(() => {
    console.log(
      `Worker ${process.pid} is listening on port ${httpServer.address().port}`
    );
  });

  // Connect to a MongoDB database
  mongoose
    .connect('mongodb://127.0.0.1/performanceDataMetrics', {
      useNewUrlParser: true,
      useUnifiedTopology: true, // Added for MongoDB
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
    });

  // Import the Machine model (Assuming you have a Machine model)
  const Machine = require('./models/Machine');

  // Function to handle socket events and database interactions
  const socketMain = (io, socket) => {
    let macAddresss;

    // Handle disconnection
    socket.on('disconnect', () => {
      // Update machine status in the database
      if (macAddresss) {
        Machine.findOneAndUpdate(
          { macAddresss: macAddresss },
          { isActivated: false },
          { new: true },
          (err, updatedMachine) => {
            if (err) {
              console.error('Error updating machine status:', err);
            } else {
              io.to('ui').emit('data', updatedMachine);
            }
          }
        );
      }
    });

    // Handle initialization of performance data
    socket.on('initperformanceDataMetrics', async (data) => {
      // Update the macAddresss variable
      macAddresss = data.macAddresss;

      // Check and add the machine data to the database
      try {
        const mongooseResponse = await checkAndAdd(data);
        console.log(mongooseResponse);
      } catch (err) {
        console.error('Error adding machine data:', err);
      }
    });

    // Handle performance data updates
    socket.on('performanceDataMetrics', (data) => {
      console.log('data for browser client', ` \n log : ${data}`);
      io.to('ui').emit('data', data);
    });
  };

  // Function to check and add machine data to the database
  const checkAndAdd = (data) => {
    return new Promise((resolve, reject) => {
      Machine.findOne({ macAddresss: data.macAddresss }, (err, doc) => {
        if (err) {
          reject(err);
        } else if (!doc) {
          // Machine record does not exist, add it
          const newMachine = new Machine(data);
          newMachine.save((err) => {
            if (err) {
              reject(err);
            } else {
              resolve('added');
            }
          });
        } else {
          // Machine record exists
          resolve('found');
        }
      });
    });
  };
}
