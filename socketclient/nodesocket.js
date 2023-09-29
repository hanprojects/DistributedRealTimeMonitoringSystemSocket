const os = require('os');
const io = require('socket.io-client');

const socket = io('http://127.0.0.1:8181');

socket.on('connect', () => {
  const macAddresss = getmacAddresssddress(); // Function to get the machine's MAC address

  // Client auth with a single key value
  //   socket.emit('nodeclient', 'nodeSocketClient');

  socket.on('init', (data) => {
    if (data.status === 'success') {
      performanceData().then((allPerformanceData) => {
        allPerformanceData.macAddresss = macAddresss;
        socket.emit('initperformanceDataMetrics', allPerformanceData);
      });
    }
  });

  // Start sending over data on an interval
  const performanceDataMetricsPerInterval = setInterval(() => {
    performanceData().then((allPerformanceData) => {
      allPerformanceData.macAddresss = macAddresss;
      socket.emit('performanceDataMetrics', allPerformanceData);
    });
  }, 1000);

  socket.on('disconnect', () => {
    clearInterval(performanceDataMetricsPerInterval);
  });
});

async function performanceData() {
  const cpus = os.cpus();

  const freeMemory = os.freeMemory();
  const totalMemory = os.totalMemory();
  const usedMem = totalMemory - freeMemory;
  const memoryUsage = Math.floor((usedMem / totalMemory) * 100) / 100;
  const osName = os.type();
  const upTime = os.uptime();
  const cpuArch = cpus[0].model;
  const cores = cpus.length;
  const executionSpeed = cpus[0].speed;
  const systemExecutionLoad = await getsystemExecutionLoad();
  const isActivated = true;

  return {
    freeMemory,
    totalMemory,
    usedMem,
    memoryUsage,
    osName,
    upTime,
    cpuArch,
    cores,
    executionSpeed,
    systemExecutionLoad,
    isActivated,
  };
}

function getsystemExecutionLoad() {
  return new Promise((resolve) => {
    const start = cpuAverage();
    setTimeout(() => {
      const end = cpuAverage();
      const idleDifference = end.idle - start.idle;
      const totalDifference = end.total - start.total;
      const percentageCpu =
        100 - Math.floor((100 * idleDifference) / totalDifference);
      resolve(percentageCpu);
    }, 100);
  });
}

function cpuAverage() {
  const cpus = os.cpus();
  let idleMs = 0;
  let totalMs = 0;

  cpus.forEach((aCore) => {
    for (const type in aCore.times) {
      totalMs += aCore.times[type];
    }
    idleMs += aCore.times.idle;
  });

  return {
    idle: idleMs / cpus.length,
    total: totalMs / cpus.length,
  };
}

function getmacAddresssddress() {
  const nI = os.networkInterfaces();
  let macAddresss;

  for (const key in nI) {
    if (!nI[key][0].internal) {
      if (nI[key][0].mac === '00:00:00:00:00:00') {
        macAddresss = Math.random().toString(36).substr(2, 15);
      } else {
        macAddresss = nI[key][0].mac;
      }
      break;
    }
  }

  return macAddresss || 'unknown';
}
