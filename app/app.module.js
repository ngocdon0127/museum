var app = angular.module('museumApp', [
	'ngRoute',
	'ngMessages',
	'ui.bootstrap',
	'angular-loading-bar',
	'cfp.loadingBar',
	'ngAnimate'
	])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
  }]);

// app.directive('validFile', function ($parse) {
//     return {
//         require: 'ngModel',
//         restrict: 'A',
//         link: function (scope, el, attrs, ngModel) {
//             var model = $parse(attrs.model);
//             var modelSetter = model.assign;
//             var maxSize = 10000;
            
//             ngModel.$render = function () {
//                 ngModel.$setViewValue(el.val());
//             };

//             el.bind('change', function () {
//                 scope.$apply(function () {
//                     ngModel.$render();
//                 });
//             });
//         }
//     };
// });
app.directive('validFile', function ($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, el, attrs, ngModel) {
            var model = $parse(attrs.ngModel);
            var modelSetter = model.assign;
            var maxSize = 10000;
            el.bind('change', function () {
                scope.$apply(function () {
                    console.log(el[0].files)
                    if (el[0].files.length > 1) {
                        modelSetter(scope, el[0].files)
                    } else{
                        modelSetter(scope, el[0].files[0])
                    }
                    var fileSize = el[0].files[0].size/1000;
                    console.log(fileSize)
                    if (fileSize > maxSize) {
                        alert("Kich thuoc file vuot qua dung luong cho phep");
                        return false;
                    } else{
                        alert("Kich thuoc file duoc chap nhan")
                    }
                });
            });
        }
    };
});

