app.factory('AuthService', ['$http', function($http){
	
	return ({
		// hostAnimal : 'http://localhost:8000/content/dong-vat/auto',
		hostName: 'http://localhost:8000'
	});
}]);

//Autocomplete
// app.directive('autoComplete', function($timeout) {
//     return function(scope, iElement, iAttrs) {
//         iElement.autocomplete({
//             source: scope[iAttrs.uiItems],
//             select: function() {
//                 $timeout(function() {
//                   iElement.trigger('input');
//                 }, 0);
//             }
//         });
//     };
// });