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

app.directive('validFile', function () {
    return {
        require: 'ngModel',
        link: function (scope, el, attrs, ngModel) {
            ngModel.$render = function () {
                ngModel.$setViewValue(el.val());
            };
            // function bindEvent(element, type, handler) {
            //     if (element.addEventListener) {
            //         element.addEventListener(type, handler, false);
            //     } else {
            //         element.attachEvent('on' + type, handler);
            //     }
            // }

            // bindEvent(el[0], 'change', function() {
            //     alert('File size:' + this.files[0].size);
            // });

            el.bind('change', function () {
                scope.$apply(function () {
                    ngModel.$render();
                });
            });
        }
    };
});

