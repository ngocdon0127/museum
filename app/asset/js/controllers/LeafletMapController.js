'use strict';
app.factory("getMarkerForMap", function ($http, AuthService) {
    return function (geoJsonObject) {
        return new Promise(function (resolve, reject) {
            var req = {
                method: 'GET',
                // url: AuthService.hostName + '/map/get-marker',
                url: '/map/get-marker',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: {
                    geoJsonObject: geoJsonObject,
                }
            };
            $http(req).then(function (response) {
                if (response.status >= 400) {
                    reject(response.data);
                } else {
                    resolve(response.data);
                }
                console.log(response)
            }, function (response) {
                console.log(response)
                // console.log(response);
                reject(response);
            });
        })
    }
});
app.controller('LeafletMapController', function ($scope, leafletDrawEvents, getMarkerForMap) {

    var drawnItems = new L.FeatureGroup();

    function clearMarkers() {
        $scope.map.markers = {
            animalMarkers: {},
            geologicalMarkers: {},
            paleontologicalMarkers: {},
            soidMarkers: {},
            vegetableMarkers: {},
            mycologyMarkers: {}
        };
    }

    function updateMarkers(geoJsonObject) {
        getMarkerForMap(geoJsonObject).then(function (data) {
            $scope.map.markers = data;
        }).catch(err => {
            alert(err);
            console.log(err);
        })
    }

    // setGeoJson([0, 1000], [1000, 0]);

    $scope.drawnItemsCount = function () {
        return drawnItems.getLayers().length;
    }

    $scope.$watch("map.markers", function () {
        $scope.numAnimal = $scope.map.markers.animalMarkers ? Object.keys($scope.map.markers.animalMarkers).length : 0;
        $scope.numGeological = $scope.map.markers.geologicalMarkers ? Object.keys($scope.map.markers.geologicalMarkers).length : 0;
        $scope.numPaleontological = $scope.map.markers.paleontologicalMarkers ? Object.keys($scope.map.markers.paleontologicalMarkers).length : 0;
        $scope.numSoil = $scope.map.markers.soidMarkers ? Object.keys($scope.map.markers.soidMarkers).length : 0;
        $scope.numVegetable = $scope.map.markers.vegetableMarkers ? Object.keys($scope.map.markers.vegetableMarkers).length : 0;
        $scope.numMycology = $scope.map.markers.mycologyMarkers ? Object.keys($scope.map.markers.mycologyMarkers).length : 0;
    })

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
                    // polygon: false,
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
                    },
                    mycologyMarkers: {
                        name: 'Nấm',
                        type: 'group',
                        visible: true
                    }
                }
            },
            watchOptions: {
                markers: {
                    type: null,
                    individual: {
                        type: null
                    }
                }
            },
            legend: {
                position: 'bottomleft',
                colors: ['#9D272C', '#1EA0D9', '#4B265E', '#F5B72F', '#008F3F', '#D35400'],
                labels: ['Động vật', 'Địa chất', 'Cổ sinh', 'Thổ nhưỡng', 'Thực vật', 'Nấm']
            }
        }
    });

    var handle = {
        created: function (e, leafletEvent, leafletObject, model, modelName) {
            drawnItems.clearLayers();
            drawnItems.addLayer(leafletEvent.layer);
            // console.log(leafletEvent);
            console.log(leafletEvent.layer.toGeoJSON());
            // var _latlngs = leafletEvent.layer._latlngs;
            updateMarkers(leafletEvent.layer.toGeoJSON())
        },
        edited: function (e, leafletEvent, leafletObject, model, modelName) {
            // console.log("edited");
            drawnItems.getLayers().forEach(function(layer){
                console.log(layer.toGeoJSON());
                updateMarkers(layer.toGeoJSON());
            })
        },
        deleted: function (arg) {
            // console.log("deleted");
            drawnItems.clearLayers();
            clearMarkers();
        },
        drawstart: function (arg) {},
        drawstop: function (arg) {},
        editstart: function (arg) {},
        editstop: function (arg) {},
        deletestart: function (arg) {
            // console.log("deletestart")
        },
        deletestop: function (arg) {
            // console.log("deletestop")
        }
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