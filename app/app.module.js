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

