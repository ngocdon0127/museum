var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var baseIcon = {
    type: 'extraMarker',
    icon: 'fa-circle',
    prefix: 'fa',
    geoJsonObject: 'circle'
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
    var geoJsonObject = JSON.parse(req.query.geoJsonObject);
    console.log(geoJsonObject);
    if (!geoJsonObject) {
        res.send({});
        return;
    }
    Promise.all([
        getMarkers("Animal", geoJsonObject, animalMarkerIcon),
        getMarkers("Geological", geoJsonObject, geologicalMarkerIcon),
        getMarkers("Paleontological", geoJsonObject, paleontologicalMarkerIcon),
        getMarkers("Soil", geoJsonObject, soidMarkerIcon),
        getMarkers("Vegetable", geoJsonObject, vegetableMarkerIcon)
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
        res.send("Có lỗi xảy ra : <br>" + err);
        console.log(err);
    });
    // var 
})


var getMarkers = function (model, geoJsonObject, icon) {
    function getPopupContent(model, ele) {
        return '<b>' + ele.tenMau.tenVietNam + '</b><br>' +
            '<i>' + ele.tenMau.tenTiengAnh + '</i>';
    }
    var ObjectModel = mongoose.model(model);
    return new Promise(function (resolve, reject) {

        ObjectModel.find({
            'extra.eGeoJSON.coordinates': {
                $geoWithin: {
                    $geometry: geoJsonObject.geometry
                }
            }
        }, {
            'extra.eGeoJSON': 1,
            'tenMau.tenVietNam': 1,
            'tenMau.tenTiengAnh': 1
        }).then(function (data) {
            var markers = {};
            data.forEach(function (ele) {
                markers[ele._id] = {
                    lat: ele.extra.eGeoJSON.coordinates[1],
                    lng: ele.extra.eGeoJSON.coordinates[0],
                    message: getPopupContent(model, ele),
                    icon: icon ? icon : {}
                }
            });
            resolve(markers);
        }).catch(error => reject(error));
    });

}

module.exports = router;