var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.get("/all", function (req, res, next) {
    var top = Number(req.query.top),
        bottom = Number(req.query.bottom),
        right = Number(req.query.right),
        left = Number(req.query.left);

    console.log("bouder");
    console.log(req.query.top);

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var Animal = mongoose.model("Animal");
    var dataset = {
        size: 0,
        data: [],
        error: false
    }
    Animal.find().then(function (data) {
        data.forEach(function (ele) {
            let kinhDo = convertCoordinate(ele.duLieuThuMau.viTriToaDo.kinhDo);
            let viDo = convertCoordinate(ele.duLieuThuMau.viTriToaDo.viDo);
            console.log("Kinh do: " + kinhDo + " viDo: " + viDo);
            if (viDo < top && viDo > bottom && kinhDo > left && kinhDo < right) {
                dataset.data.push({
                    "type": "Feature",
                    "properties": {
                        "id": ele._id,
                        "name": "Coors Field",
                        "amenity": "Baseball Stadium",
                        "popupContent": "This is where the <b>Rockies play!</b>"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [kinhDo, viDo]
                    }
                });
            }
        })
        dataset.size = dataset.data.length;
        res.send(dataset);
    }, function (err) {
        dataset.error = err;
        res.send(dataset);
    })
});

router.get("/get-marker", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var rectangleBoundary = JSON.parse(req.query.rectangleBoundary);
    console.log(rectangleBoundary);
    if(!rectangleBoundary){
        res.send({});
        return;
    }
    Promise.all([
        getMarkers("Animal", rectangleBoundary),
        getMarkers("Geological", rectangleBoundary),
        getMarkers("Paleontological", rectangleBoundary),
        getMarkers("Soil", rectangleBoundary),
        getMarkers("Vegetable", rectangleBoundary)
    ]).then(function (results) {
        res.send({
            animalMarkers: results[0],
            geologicalMarkers: results[1],
            paleontologicalMarkers: results[2],
            soidMarkers: results[3],
            vegetableMarkers: results[4],
        });
    }).catch(err => {
        res.status(500);
        res.send("Có lỗi xảy ra");
    });
    // var 
})


var getMarkers = function (model, rectangleBoundary) {
    function getPopupContent(model, ele){
        return '<a href="https://google.com">Google</a>';
    }
    var ObjectModel = mongoose.model(model);
    return new Promise(function (resolve, reject) {
        ObjectModel.find().then(function (data) {
            var markers = {};
            data.forEach(function (ele) {
                let kinhDo = convertCoordinate(ele.duLieuThuMau.viTriToaDo.kinhDo);
                let viDo = convertCoordinate(ele.duLieuThuMau.viTriToaDo.viDo);
                if (viDo < rectangleBoundary.top &&
                    viDo > rectangleBoundary.bottom &&
                    kinhDo > rectangleBoundary.left &&
                    kinhDo < rectangleBoundary.right) {
                    markers[ele._id] = {
                        lat: viDo,
                        lng: kinhDo,
                        message: ele._id + "<b>test</b>",
                    }
                }
            });
            resolve(markers);
        }).catch(error => reject(error));
    });

}

function convertCoordinate(coordinate) {
    if (typeof (coordinate) == 'string') {
        coordinates = coordinate.split(/[°'"]/);
        // console.log(Number(coordinates[0]));
        return Number(coordinates[0]) + (Number(coordinates[1]) + Number(coordinates[2]) / 60) / 60;
    }
}

module.exports = router;