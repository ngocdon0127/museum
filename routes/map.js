var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var path = require('path');

var baseIcon = {
    type: 'extraMarker',
    icon: 'fa-circle',
    prefix: 'fa',
    // shape: 'circle'
};

const objectModel = {
    "Animal" : {
        uploadUrl : "/uploads/animal",
        contentUrl : "/content/dong-vat"
    },
    "Geological" : {
        uploadUrl : "/uploads/geological",
        contentUrl : "/content/dia-chat"
    },
    "Paleontological": {
        uploadUrl : "/uploads/paleontological",
        contentUrl : "/content/co-sinh"
    },
    "Soil" : {
        uploadUrl : "/uploads/soil",
        contentUrl : "/content/tho-nhuong"
    },
    "Vegetable" : {
        uploadUrl : "/uploads/vegetable",
        contentUrl : "/content/thuc-vat"
    }
}

var animalMarkerIcon = Object.assign({}, baseIcon, {
        markerColor: 'red'
    }),
    geologicalMarkerIcon = Object.assign({}, baseIcon, {
        markerColor: 'cyan'
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
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
        res.status(406);
        if(err.name == "MongoError" && err.codeName == 'BadValue'){
            res.send("Có lỗi xảy ra : \n" + "Hình dạng vùng truy vấn không hợp lệ. Chọn vùng truy vấn khác!");
        } else {
            res.send("Có lỗi xảy ra : \n" + err);
        }
    });
    // var 
})


var getMarkers = function (model, geoJsonObject, icon) {
    function getPopupContent(ele) {
        var popupContent = '<b>' + ele.tenMau.tenVietNam + '</b><br>' +
                            '<i>' + ele.tenMau.tenTiengAnh + '</i><br>';
        if(ele.media.anhMauVat.length) {
            popupContent += "<img src='" + 
                path.join('https://baotangvn.online',objectModel[model].uploadUrl, ele.media.anhMauVat[0])
                + "' width='100%'/>";
        }

        popupContent = '<a target="_blank" href="' 
            + path.join(objectModel[model].contentUrl, ele._id + "?display=html")
            + '">' + popupContent + '</a>';
        popupContent = '<div align="center">' + popupContent + '</div>';
        return popupContent;

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
            'tenMau.tenTiengAnh': 1,
            'media': 1
        }).then(function (data) {
            var markers = {};
            data.forEach(function (ele) {
                markers[ele._id] = {
                    lat: ele.extra.eGeoJSON.coordinates[1],
                    lng: ele.extra.eGeoJSON.coordinates[0],
                    message: getPopupContent(ele),
                    icon: icon ? icon : {}
                }
            });
            resolve(markers);
        }).catch(error => reject(error));
    });

}

module.exports = router;