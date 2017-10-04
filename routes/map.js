var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var baseIcon = {
    type: 'extraMarker',
    icon: 'fa-circle',
    prefix: 'fa',
    shape: 'circle'
};

var animalMarkerIcon = Object.assign({}, baseIcon, {
        markerColor: 'red' 
    }),
    geologicalMarkerIcon = Object.assign({}, baseIcon, {
        markerColor: 'orange'
    }),
    paleontologicalMarkerIcon = Object.assign({}, baseIcon, {
        markerColor: 'purple'
    }),
    soidMarkerIcon = Object.assign({}, baseIcon, {
        markerColor: 'yellow'
    }),
    vegetableMarkerIcon = Object.assign({}, baseIcon, {
        markerColor: 'green'
    });

    router.get("/get-marker", function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var rectangleBoundary = JSON.parse(req.query.rectangleBoundary);
        console.log(rectangleBoundary);
        if (!rectangleBoundary) {
            res.send({});
            return;
        }
        Promise.all([
            getMarkers("Animal", rectangleBoundary, animalMarkerIcon),
            getMarkers("Geological", rectangleBoundary, geologicalMarkerIcon),
            getMarkers("Paleontological", rectangleBoundary, paleontologicalMarkerIcon),
            getMarkers("Soil", rectangleBoundary, soidMarkerIcon),
            getMarkers("Vegetable", rectangleBoundary, vegetableMarkerIcon)
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


var getMarkers = function (model, rectangleBoundary, icon) {
    function getPopupContent(model, ele) {
        return '<b>' + ele.tenMau.tenVietNam + '</b><br>' +
                '<i>'+ ele.tenMau.tenTiengAnh +'</i>';
    }
    var ObjectModel = mongoose.model(model);
    return new Promise(function (resolve, reject) {
        ObjectModel.find({}, {'duLieuThuMau.viTriToaDo': 1, 'tenMau.tenVietNam': 1, 'tenMau.tenTiengAnh': 1}).then(function (data) {
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
                        message: getPopupContent(model, ele),
                        icon: icon ? icon : {}
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