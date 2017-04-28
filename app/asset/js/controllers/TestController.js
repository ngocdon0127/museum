app.controller('TestController',function($http,$scope){ 
    //controller in angularjs ng-model, ng-bind
    // $scope.data="abc"
    console.log("lksdgngakd")
    var url = "http://localhost:8000/content/thuc-vat"
    $http.get(url).then(function(res){
        $scope.data = res.data.vegetables[0]
        console.log($scope.data)
    }, function(err){
        console.log("Khong lay duoc du lieu")
    })
})