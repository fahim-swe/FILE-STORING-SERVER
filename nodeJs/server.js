const http = require('http');
const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, '../resources');
const outputFile = 'server.log';

const mimeTypes = {
  txt: 'text/plain',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

// Set max header size to 1 MB
const server = http.createServer((req, res) => {
  req.connection.server.maxHeaderSize = 1024 * 1024;

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end('Method Not Allowed');
    return;
  }

  if (req.url === '/') {
    handleGetRootRequest(req, res);
  } else {
    handleGetRequest(req, res);
  }
});



function handleGetRootRequest(req, res) {
    fs.readdir(resourcesDir, (err, files) => {
      if (err) {
        console.error(`Unable to scan directory: ${err}`);
        appendToLog(req, res, 500, `Internal Server Error - Unable to scan directory: ${err.message}`);
        res.end('Internal Server Error');
        return;
      }
  
      const filesList = ['<h1>List of Files:</h1>'];
      files.forEach((file, index) => {
        filesList.push(`<p>${index + 1}. <a target="_blank" href="${file}">${file}</a></p>`);
      });
  
      const responseContent = filesList.join('\n');
  
      appendToLog(req, res, 200, 'On root');
      respondWithContent(res, responseContent, 'text/html');
    });
  }
  
  

function handleGetRequest(req, res) {
  const requestedFile = path.join(resourcesDir, req.url);

  if (!fs.existsSync(requestedFile)) {
    appendToLog(req, res, 404, 'Content not found');
    res.end('Not Found');
    return;
  }

  const contentType = mimeTypes[path.extname(requestedFile).slice(1)] || 'text/plain';
  res.setHeader('Content-Type', contentType);

  fs.access(requestedFile, fs.constants.R_OK, (err) => {
    if (err) {
      appendToLog(req, res, 403, `Forbidden - Unable to access file: ${err.message}`);
      res.end('Forbidden');
      return;
    }

    const fileStream = fs.createReadStream(requestedFile);
    fileStream.on('open', () => {
      appendToLog(req, res, 200, 'Found');
      fileStream.pipe(res);
    });

    fileStream.on('error', (err) => {
      appendToLog(req, res, 500, `Internal server error - Unable to read file: ${err.message}`);
      res.end(`Internal Server Error: ${err.message}`);
    });
  });
}

function appendToLog(req, res, statusCode, message) {
  const logLine = `${new Date().toISOString()} ${req.method} ${statusCode} ${req.socket.remoteAddress} ${req.url} ${message}\n`;

  try {
    fs.appendFileSync(outputFile, logLine);
  } catch (err) {
    console.error(`Unable to append to log: ${err}`);
  }
}

function respondWithContent(res, content, contentType) {
  res.setHeader('Content-Type', contentType);
  res.end(content);
}

server.listen(3000, () => {
    console.log('Listening on http://localhost:3000/');
    if (!fs.existsSync(outputFile)) {
      fs.writeFileSync(outputFile, '');
    }
  });
  