var http = require('http'), fs = require('fs'),
Canvas = require('canvas');
var ht = require('https');
http.createServer(function (req, res) {
 dr();
function dr()
{

    fs.readFile('simba.jpg', function(err, data) {
        if (err) throw err;
        var img = new Canvas.Image; // Create a new Image
        img.src = data;

        var canvas = new Canvas(1000, 1000, 'pdf');
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 10, 10, img.width, img.height);
        ctx.addPage();
        // ctx.drawImage(img, 0, 0, img.width, img.height);
        // var prew = img.width / 4;
        // var preh = img.height / 4;
        img = new Canvas.Image; // New Image
        data = fs.readFileSync('trang.JPG');
        img.src = data;
        // console.log(ctx.drawImage(img, 0, preh + 10, img.width, img.height));
        console.log(ctx.drawImage(img, 10, 10, img.width, img.height));
        console.log(canvas.toBuffer());
        fs.writeFileSync('test.pdf', canvas.toBuffer());
        var regex = new RegExp("^.{1,100}$");
        console.log(regex.test('hehe'));

        res.writeHead(200, {'content-type' : 'application/pdf'});
    res.write( canvas.toBuffer() );
    res.end();  
    });

}

}).listen(8124);