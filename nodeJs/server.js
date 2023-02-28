var path = require('path');
var http = require('http');
var fs = require('fs');



var dir = path.join(__dirname, '../resources');
const outputFile = 'Output.txt';
let content = '';

var mime = {
    txt: 'text/plain',
    gif: 'image/gif',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    png: 'image/png'
};


function appendFile(content)
{
    try{
        fs.appendFileSync(outputFile, content);
    }
    catch(err){
        return ;
    }
}


function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}

const server = http.createServer((req, res) => {
    const { method, url } = req;
    res.status = 200;
    res.setHeader("Content-type", "text/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");


    if(url === "/" && method === "GET")
    {
        var filesList = " LIST OF FILES\n";
        fs.readdir(dir, function(err, files){
            if(err)
            {
                return console.log('Unable to scan directory: ' + err);
            }
            var count = 1;
            files.forEach(function(file){
                filesList += "\t" + count +  "\t" + (file+" \n");
                count++;

            }) 

            filesList += "To see spesific file \n";
            
            appendFile(`${req.method}  ${res.statusCode}  ------  ${req.socket.remoteAddress} ${url} On root\n`);
            res.end(filesList);
        })
    }

    else if(method === "GET" && url)
    {
        var reqpath = req.url;

        var file = path.join(dir, reqpath);

        var type = mime[path.extname(file).slice(1)] || 'text/plain';
        res.setHeader('Content-Type', type);
        console.log(type);

        var s = fs.createReadStream(file);
    
        s.on('open', function () {
            appendFile(`GET ${res.statusCode} ${getFilesizeInBytes(file)}Bytes ${req.socket.remoteAddress} ${url}  Found\n`);
            console.log("is open");
            s.pipe(res);
        });
        s.on('error', function () {
            
            console.log("thriws error");
            res.statusCode = 404;
            appendFile(`GET  ${res.statusCode} ------- ${req.socket.remoteAddress} ${url} Content Not found\n`);
            res.end('Not found');
        });
    }
    
});

server.listen(3000, function () {
    console.log('Listening on http://localhost:3000/');
    console.log(content);
    if (!fs.existsSync('/home/dsi/Documents/Task/nodeJs/Output.txt')) {
        fs.writeFileSync(outputFile, content);
    } else {
        fs.writeFileSync(outputFile, content);
    }
 
});