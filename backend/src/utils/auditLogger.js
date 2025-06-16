const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/auth.log');

function logAuthEvent(event) {
  const logEntry = `[${new Date().toISOString()}] ${event}\n`;
  fs.appendFile(logFile, logEntry, err => {
    if (err) console.error('Failed to write audit log:', err);
  });
}

module.exports = logAuthEvent;