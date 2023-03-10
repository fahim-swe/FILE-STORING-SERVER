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
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
};


const server = http.createServer((req, res) => {
  

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

 
  const stats = fs.statSync(requestedFile);
  if (stats.isDirectory()) {
    const filesList = scanDirectory(requestedFile);

    const responseContent = [
      '<h1>List of Files:</h1>',
      ...filesList.map((file, index) => `<p>${index + 1}. <a target="_blank" href="${file}">${file}</a></p>`)
    ].join('\n');

    appendToLog(req, res, 200, 'On directory');
    respondWithContent(res, responseContent, 'text/html');
    return;
  }

 
  const contentType = mimeTypes[path.extname(requestedFile).slice(1)] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);

  fs.access(requestedFile, fs.constants.R_OK, (err) => {
    if (err) {
      appendToLog(req, res, 403, `Forbidden - Unable to access file: ${err.message}`);
      res.statusCode = 403;
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

function scanDirectory(directoryPath) {
  let filesList = [];

  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    filesList.push(directoryPath.split('/')[directoryPath.split('/').length-1] +'/'+ entry.name);
   // console.log(directoryPath);
   // console.log( directoryPath.split('/')[directoryPath.split('/').length-1]);
  }

  return filesList;
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
  