var path = require('path');
var http = require('http');
var fs = require('fs');




var dir = path.join(__dirname, '../resources');

var mime = {
    txt: 'text/plain',
    gif: 'image/gif',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    png: 'image/png'
};

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
           

            console.log(filesList);
            res.end(filesList);
            
        })
    }

    if(method === "GET" && url)
    {
        var reqpath = req.url;
        console.log(reqpath);

        var file = path.join(dir, reqpath);
    
        if (file.indexOf(dir + path.sep) !== 0) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            return res.end('Forbidden');
        }

        var type = mime[path.extname(file).slice(1)] || 'text/plain';

        console.log(type);

        var s = fs.createReadStream(file);
    
        s.on('open', function () {
            console.log("is open");
            res.setHeader('Content-Type', type);
            s.pipe(res);
        });
        s.on('error', function () {
            console.log("thriws error");
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 404;
            res.end('Not found');
        });
    }
    
});

server.listen(3000, function () {
    console.log('Listening on http://localhost:3000/');
});