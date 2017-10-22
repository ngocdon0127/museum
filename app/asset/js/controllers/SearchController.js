app.controller('SearchController', function ($scope, $http, AuthService, $uibModal, leafletDrawEvents) {
    var url = AuthService.hostName + '/content/search';
    $scope.searchResult = "0 kết quả"
    $scope.data = [];
    $scope.searchContent = {};
    $scope.searchSample = function (content) {
        $scope.searchResult = "Loading...";
        var config = {
            params: $scope.searchContent
        }
        $http.get(url, config).then(function (res) {
            console.log(config);
            $scope.data = res.data.matchedSamples;
            console.log($scope.data);
            $scope.searchResult = $scope.data.length + " kết quả";
        }, function (err) {
            console.log(err);
        });
        // $scope.$apply()
    }

    $scope.viewby = "10";
    $scope.currentPage = 1;

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.sortReverse = !$scope.sortReverse; //if true make it false and vice versa
    }

    $scope.selectedAll = false;
    $scope.selectAll = function () {
        $scope.selectedAll = !$scope.selectedAll;
        var arr = document.getElementsByClassName("check-box");
        for (var i = arr.length - 1; i >= 0; i--) {
            arr[i].checked = $scope.selectedAll;
        }
    }

    $scope.export = function (id) {
        $scope.opts = {
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl: 'views/modals/search-export.blade.html',
            controller: ModalInstanceCtrl,
            controllerAs: "$ctrl",
            resolve: {
                fields: function () {
                    return $scope.fields
                }
            }
        };

        var modalInstance = $uibModal.open($scope.opts);
        modalInstance.result.then(function () {
            var x = document.getElementsByName("fields");
            let _tmp = "";
            // Get fields to export
            if (x.length != 0) {
                _tmp = x[0].value;
            }
            if (_tmp == "") {
                AuthService.exportFile(id, _tmp);
            } else {
                let data = _tmp.replace(new RegExp("_-_", "g"), "=1&")
                data = "custom=1&" + data + "=1"
                AuthService.exportFile(id, data);
            }
        }, function () {
            // on cancel button press
        })
    };

    //config phần bản đồ

    var drawnItems = new L.FeatureGroup();

    $scope.drawnItemsCount = function () {
        return drawnItems.getLayers().length;
    }

    angular.extend($scope, {
        map: {
            markers: {},
            center: {
                lat: 20.6,
                lng: 105.38,
                zoom: 4,
                // autoDiscover: true
            },
            drawOptions: {
                position: "topright",
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
        }
    });

    var handle = {
        created: function (e, leafletEvent, leafletObject, model, modelName) {
            e.stopPropagation();
            console.log("created");
            drawnItems.clearLayers();
            drawnItems.addLayer(leafletEvent.layer);
            $scope.searchContent.geoJsonObject = leafletEvent.layer.toGeoJSON();
            $scope.searchSample();
        },
        edited: function (e, leafletEvent, leafletObject, model, modelName) {
            console.log("edited");
            drawnItems.getLayers().forEach(function (layer) {
                // console.log(layer.toGeoJSON());
                $scope.searchContent.geoJsonObject = layer.toGeoJSON();
                $scope.searchSample();
            })
        },
        deleted: function (arg) {
            console.log("deleted");
            drawnItems.clearLayers();
            delete $scope.searchContent.geoJsonObject;
            $scope.searchSample();
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
})