app.controller('SearchController', function (leafletData, $timeout, $scope, $http, AuthService, $uibModal, leafletDrawEvents) {
    var url = AuthService.hostName + '/content/search';
    $scope.searchResult = "0 kết quả"
    $scope.data = [];
    $scope.searchContent = {};

    $http.get(url + "?q='123'").then(function (res) {
        $scope.data = res.data.matchedSamples;
        // console.log($scope.data);
        $scope.searchResult = $scope.data.length + " kết quả";
    }, function (err) {
        console.log(err);
    });

    $scope.minRangeSlider = {
        minValue: 1000,
        maxValue: 3000,
        options: {
            floor: 1000,
            ceil: 3000,
            step: 1,
            noSwitching: true
        }
    };

    $scope.modelBoolean = {
        "Động vật": false,
        "Thực vật": false,
        "Thổ nhưỡng": false,
        "Cổ sinh": false,
        "Địa chất": false
    };
    $scope.modelMapping = {
        "Động vật": "dong-vat",
        "Thực vật": "thuc-vat",
        "Thổ nhưỡng": "tho-nhuong",
        "Cổ sinh": "co-sinh",
        "Địa chất": "dia-chat"
    };

    $scope.sampleClick = function (content, id) {
        $scope.searchContent.model = "";
        $scope.modelBoolean[content] = !$scope.modelBoolean[content]
        angular.forEach($scope.modelBoolean, function(val, element){
            // console.log(element, val);
            if (val) {
                $scope.searchContent.model = $scope.searchContent.model + element + ",";
            }
        });
        // console.log($scope.searchContent.model);
        $scope.searchSample();
    }

    $scope.searchSample = function (content) {
        $scope.searchResult = "Loading...";
        var config = {
            params: $scope.searchContent
        }
        $http.get(url, config).then(function (res) {
            // console.log(config);
            $scope.data = res.data.matchedSamples;
            // console.log($scope.data);
            $scope.searchResult = $scope.data.length + " kết quả";
        }, function (err) {
            console.log(err);
        });
        // $scope.$apply()
    }

    $scope.viewby = "10";
    $scope.currentPage = 1;

    $scope.ndtChange = function () {
        // alert($scope.searchContent.ngayDinhTen);
        $scope.searchContent.ngayDinhTen = $scope.startYearNDT + "," + $scope.stopYearNDT;
        $scope.searchSample();
    }
    $scope.tgtmChange = function () {
        // alert($scope.searchContent.ngayDinhTen);
        $scope.searchContent.thoiGianThuMau = $scope.startYearTGTM + "," + $scope.stopYearTGTM;
        $scope.searchSample();
    }

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
    $scope.openmap = function () {
        leafletData.getMap().then(function(map) {
            $timeout(function() {
              map.invalidateSize();
            }, 200);
        });
    }

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
            geofences: {},
            defaults: {
                scrollWheelZoom: true,
                zoomControl: false,
                controls :{
                            layers : {
                                visible: true,
                                position: 'topright',
                                collapsed: false
                                     }
                            }
            },
            layers: {
                baselayers: {
                    xyz: {
                        name: 'OpenStreetMap (XYZ)',
                        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
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
            // console.log("deleted");
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
    // console.log(drawEvents);
    drawEvents.forEach(function (eventName) {
        $scope.$on('leafletDirectiveDraw.' + eventName, function (e, payload) {
            //{leafletEvent, leafletObject, model, modelName} = payload
            var leafletEvent, leafletObject, model, modelName; //destructuring not supported by chrome yet :(
            leafletEvent = payload.leafletEvent, leafletObject = payload.leafletObject, model = payload.model,
                modelName = payload.modelName;

            handle[eventName.replace('draw:', '')](e, leafletEvent, leafletObject, model, modelName);
        });
    });

    // $scope.map.invalidateSize();
})