const http = require('http');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../resources');
const outputFile = 'Output.txt';

const mime = {
  txt: 'text/plain',
  gif: 'image/gif',
  jpg: 'image/jpg',
  jpeg: 'image/jpeg',
  png: 'image/png'
};

function appendFile(content) {
  try {
    fs.appendFileSync(outputFile, content);
  } catch (err) {
    console.error(err);
  }
}

function getFileSizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

function handleGetRootRequest(req, res) {
  fs.readdir(dir, function (err, files) {
    if (err) {
      console.error('Unable to scan directory: ' + err);
      res.statusCode = 500;
      res.end('Internal Server Error');
      return;
    }

    const filesList = ['LIST OF FILES'];
    files.forEach(function (file, index) {
      filesList.push(`${index + 1}. ${file}`);
    });
    filesList.push('To see specific file');

    const responseContent = filesList.join('\n');

    appendFile(`${req.method}  ${res.statusCode}  ------  ${req.socket.remoteAddress} ${req.url} On root\n`);

    res.setHeader('Content-Type', 'text/plain');
    res.end(responseContent);
  });
}

function handleGetRequest(req, res) {
  const reqPath = req.url;
  const file = path.join(dir, reqPath);

  const contentType = mime[path.extname(file).slice(1)] || 'text/plain';
  res.setHeader('Content-Type', contentType);

  const s = fs.createReadStream(file);

  s.on('open', function () {
    appendFile(`GET ${res.statusCode} ${getFileSizeInBytes(file)} Bytes ${req.socket.remoteAddress} ${req.url} Found\n`);
    s.pipe(res);
  });

  s.on('error', function () {
    res.statusCode = 404;
    appendFile(`GET  ${res.statusCode} ------- ${req.socket.remoteAddress} ${req.url} Content Not found\n`);
    res.end('Not found');
  });
}

const server = http.createServer((req, res) => {
  res.status = 200;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'GET') {
    if (req.url === '/') {
      handleGetRootRequest(req, res);
    } else {
      handleGetRequest(req, res);
    }
  }
});

server.listen(3000, function () {
  console.log('Listening on http://localhost:3000/');
  if (!fs.existsSync(outputFile)) {
    fs.writeFileSync(outputFile, '');
  }
});