var http = require('http'), fs = require('fs'),
Canvas = require('canvas');
var ht = require('https');
http.createServer(function (req, res) {
 dr();
function dr()
{

    fs.readFile(__dirname + '/beauty.jpg', function(err, data) {
        if (err) throw err;
        var img = new Canvas.Image; // Create a new Image
        img.src = data;

        var canvas = new Canvas(img.width, img.height, 'pdf');
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);

        res.writeHead(200, {'content-type' : 'application/pdf'});
    res.write( canvas.toBuffer() );
    res.end();  
    });

}

}).listen(8124);