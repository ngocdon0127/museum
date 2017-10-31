app.controller('HomeController', function ($http, $scope, AuthService) {
    $http.get('/content/get-random/12').then(function (res) {
        console.log(res);
        $scope.images = res.data.data;
    }, function (err) {
        console.log(err);
    });
});