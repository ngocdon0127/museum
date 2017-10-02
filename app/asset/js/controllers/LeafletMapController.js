'use strict';
app.factory("getMarkerForMap", function ($http) {
    return function (rectangleBoundary) {
        return new Promise(function (resolve, reject) {
            var req = {
                method: 'GET',
                url: 'http://localhost:8000/map/get-marker',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: {
                    rectangleBoundary: rectangleBoundary,
                }
            };
            $http(req).then(function (response) {
                resolve(response.data);
                console.log(response.data)
            }, function (response) {
                console.log(response);
                reject(response);
            });
        })
    }
});
app.controller('LeafletMapController', function ($scope, leafletDrawEvents, getMarkerForMap) {

    var drawnItems = new L.FeatureGroup();

    function clearMarkers() {
        $scope.map.markers = {};
    }

    function updateMarkers(rectangleBoundary) {
        getMarkerForMap(rectangleBoundary).then(function (data) {
            $scope.map.markers = data;
        })
    }

    // setGeoJson([0, 1000], [1000, 0]);

    $scope.drawnItemsCount = function () {
        return drawnItems.getLayers().length;
    }


    angular.extend($scope, {
        map: {
            markers: {},
            center: {
                lat: 20.6,
                lng: 105.38,
                zoom: 7
            },
            drawOptions: {
                position: "bottomright",
                draw: {
                    polyline: false,
                    polygon: false,
                    circle: false,
                    marker: false
                },
                edit: {
                    featureGroup: drawnItems,
                    remove: true
                }
            },
            layers: {
                baselayers: {
                    xyz: {
                        name: 'OpenStreetMap (XYZ)',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            showOnSelector: false
                        }
                    }
                },
                overlays: {
                    animalMarkers: {
                        name: 'Động vật',
                        type: 'group',
                        visible: true
                    },
                    geologicalMarkers: {
                        name: 'Địa chất',
                        type: 'group',
                        visible: true
                    },
                    paleontologicalMarkers: {
                        name: 'Cổ sinh',
                        type: 'group',
                        visible: true
                    },
                    soidMarkers: {
                        name: 'Thổ nhưỡng',
                        type: 'group',
                        visible: true
                    },
                    vegetableMarkers: {
                        name: 'Thực vật',
                        type: 'group',
                        visible: true
                    }
                }
            }
        }
    });

    var handle = {
        created: function (e, leafletEvent, leafletObject, model, modelName) {
            drawnItems.clearLayers();
            drawnItems.addLayer(leafletEvent.layer);
            // console.log(leafletEvent);
            console.log(leafletEvent.layer._latlngs);
            var _latlngs = leafletEvent.layer._latlngs;
            updateMarkers({
                left: _latlngs[0].lng,
                bottom: _latlngs[0].lat,
                top: _latlngs[2].lat,
                right: _latlngs[2].lng
            })
        },
        edited: function (e, leafletEvent, leafletObject, model, modelName) {
            console.log("edited");
            console.log(leafletEvent);
            console.log(e);
        },
        deleted: function (arg) {},
        drawstart: function (arg) {},
        drawstop: function (arg) {},
        editstart: function (arg) {},
        editstop: function (arg) {},
        deletestart: function (arg) {},
        deletestop: function (arg) {}
    };

    var drawEvents = leafletDrawEvents.getAvailableEvents();
    drawEvents.forEach(function (eventName) {
        $scope.$on('leafletDirectiveDraw.' + eventName, function (e, payload) {
            //{leafletEvent, leafletObject, model, modelName} = payload
            var leafletEvent, leafletObject, model, modelName; //destructuring not supported by chrome yet :(
            leafletEvent = payload.leafletEvent, leafletObject = payload.leafletObject, model = payload.model,
                modelName = payload.modelName;

            handle[eventName.replace('draw:', '')](e, leafletEvent, leafletObject, model, modelName);
        });
    });
});