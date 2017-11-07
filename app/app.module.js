var app = angular.module('museumApp', [
	'ngMessages',
    'bsLoadingOverlay',
    'bsLoadingOverlayHttpInterceptor',
    'ui.router',
    'rzModule',
    'ui.bootstrap',
	'angular-loading-bar',
	'cfp.loadingBar',
	'ngAnimate',
    'bw.paging',
    'angular-js-xlsx',
    'ngSanitize',
    'InlineTextEditor',
    'ng',
    'ngMap',
    'ngCookies',
    'pascalprecht.translate',
    'ui-leaflet',
    'angularUtils.directives.dirPagination'
    // 'nouislider'
])
.factory('allHttpInterceptor', function(bsLoadingOverlayHttpInterceptorFactoryFactory) {
    return bsLoadingOverlayHttpInterceptorFactoryFactory();
})
.config(function($httpProvider) {
    $httpProvider.interceptors.push('allHttpInterceptor');
}).run(function(bsLoadingOverlayService) {
    bsLoadingOverlayService.setGlobalConfig({
        templateUrl: 'views/users/loading-overlay-template.html'
    });
});

//Hàm valid file cũ, giờ không sử dụng chuyển sang cái mới
// app.directive('validFile', function ($parse) {
//     return {
//         require: 'ngModel',
//         restrict: 'A',
//         link: function (scope, el, attrs, ngModel) {
//             var model = $parse(attrs.ngModel);
//             var modelSetter = model.assign;
//             var maxSize = 10;
//             el.bind('change', function () {
//                 scope.$apply(function () {
//                     console.log(el[0].files)
//                     if (el[0].files.length > 1) {
//                         modelSetter(scope, el[0].files)
//                     } else{
//                         modelSetter(scope, el[0].files[0])
//                     }
//                     var fileSize = el[0].files[0].size/1024/1024;
//                     // console.log(fileSize)
//                     if (fileSize > maxSize) {
//                         alert("Kich thuoc file vuot qua dung luong cho phep");
//                         return false;
//                     }
//                 });
//             });
//         }
//     };
// });

// Hiển thị thông báo, cần chạy ngay từ khi khởi động để có thể áp dụng được cho tất cả các controller
app.controller('ModalInstanceCtrl', function ($location, $uibModalInstance, $scope, msg, id, $anchorScroll) {
    $scope.message = msg;
    $scope.ok = function () {
        $uibModalInstance.dismiss();
        if (id !== "") {
            $location.hash(id);
            $anchorScroll.yOffset = 100;
            $anchorScroll();
            try{
                // console.log("Loi o vi tri: " + id);
                if ((id == 'viDo') || (id == 'kinhDo')) {
                    console.log("Loi trong vi tri toa do");
                    var x = document.querySelectorAll('#' + id);
                    Array.prototype.forEach.call(x, function(element){
                        element.style.borderColor = "red";
                    });
                } else {
                    var x = document.getElementById(id);
                    var element = x.nextElementSibling
                    element.style.borderColor = "red";
                    console.log(x);
                }
            } catch(e){
                var x = document.getElementsByName(id);
                x[0].style.borderColor = "red";
            }
        }
    }
});

app.controller('translateCtrl', function($scope, $translate) {
    $scope.changeLang = function changeLangFn(langKey) {
      $translate.use(langKey);
    };
  }
);

app.controller('GoogleMapController', function($scope, $uibModal){
    $scope.showModal = function () {
        $scope.modal = $uibModal.open({
            templateUrl: 'views/modals/storeShowModal.blade.html',
            controller: 'ModalShowStore',
            scope: $scope,
            resolve: {
                store: function () {
                    return {"name": "Xin mời chọn trên bản đồ", "latitude": 21.026341, "longitude": 105.845718 };
                }
            }
        });
    };

    $scope.closeModal = function () {
        $scope.modal.close();
    };

    $scope.latChange = function () {
        if ($scope.data.viDo_do) {
            $scope.data.viDo_do = parseInt($scope.data.viDo_do)
        }
        if ($scope.data.viDo_phut) {
            $scope.data.viDo_phut = parseInt($scope.data.viDo_phut)
        }
        if ($scope.data.viDo_giay) {
            $scope.data.viDo_giay = parseInt($scope.data.viDo_giay)
        }
        $scope.data.viDo = $scope.data.viDo_do + " ° " + $scope.data.viDo_phut + " ' " + $scope.data.viDo_giay + '"';
    }
    $scope.lonChange = function () {
        if ($scope.data.kinhDo_do) {
            $scope.data.kinhDo_do = parseInt($scope.data.kinhDo_do)
        }
        if ($scope.data.kinhDo_phut) {
            $scope.data.kinhDo_phut = parseInt($scope.data.kinhDo_phut)
        }
        if ($scope.data.kinhDo_giay) {
            $scope.data.kinhDo_giay = parseInt($scope.data.kinhDo_giay)
        }
        $scope.data.kinhDo = $scope.data.kinhDo_do + " ° " + $scope.data.kinhDo_phut + " ' " + $scope.data.kinhDo_giay + '"';
    }
})

app.controller('ModalShowStore', function ($scope, $uibModalInstance, NgMap, store) {
    $scope.center = [store.latitude,store.longitude];
    $scope.position = [store.latitude,store.longitude];
    NgMap.getMap().then(function (map) {
        var markers = [];
        google.maps.event.trigger(map, "resize"); 
        // google.maps.event.addListener(map, "mouseover", function (e) {
        //     console.log(e.latLng.lat());
        //     var infoWindow = new google.maps.InfoWindow({
        //         content: 'Vĩ độ: ' + e.latLng.lat() + '<br />Kinh độ: ' + e.latLng.lng()
        //     });
        //     infoWindow.open(map, this);
        // });
        google.maps.event.addListener(map, 'click', function(event) {

            var location = event.latLng;
            //Xoa tat ca nhung marker truoc do
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
            // Tao marker tren ban do
            var marker = new google.maps.Marker({
                position: location,
                map: map
            });

            // Bat su kien mouseover khi di chuyen qua marker
            marker.addListener("mouseover", function (e) {
                var infoWindow = new google.maps.InfoWindow({
                    content: 'Vĩ độ: ' + location.lat() + '<br />Kinh độ: ' + location.lng()
                });
                infoWindow.open(map, marker);
            });
            // Day du lieu toa do ve form 
            $scope.data.fViTriToaDo = 'dd';
            $scope.data.viDo = event.latLng.lat();
            $scope.data.kinhDo = event.latLng.lng();
            markers.push(marker);
        });
    });

    $scope.store = store;

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
});