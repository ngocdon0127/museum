app.controller('AnimalManageController', function ($scope, $http, AuthService) {
    
    $scope.link = 'dong-vat';
    var url = AuthService.hostName + '/content/dong-vat';
    $http.get(url).then(function (res) {
        $scope.data = res.data.animals;
        $scope.status = res.data.status;
        $scope.totalItems = $scope.data.length;
        // setTable();
    }, function (err) {
        console.log(err);
        $scope.status = res.data.status;
    });

    $scope.viewby = "10"; 
    
    $scope.currentPage = 4;
    $scope.itemsPerPage = $scope.viewby;
    $scope.maxSize = 5; //Number of pager buttons to show

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);
    };

    $scope.setItemsPerPage = function(num) {
      $scope.itemsPerPage = num;
      $scope.currentPage = 1; //reset to first page
    }

    $scope.selectedAll = false;
    $scope.selectAll = function () {
        $scope.selectedAll = !$scope.selectedAll;
        var arr = document.getElementsByClassName("check-box");
        for (var i = arr.length - 1; i >= 0; i--) {
            arr[i].checked = $scope.selectedAll;
        }
    }

    $scope.approvePost = function (id, approved) {
        AuthService.approvePost(id, approved, 'dong-vat')
    }

    $scope.duplicateFile = function (id, form) {
        var redirect = {sample: 'animal', link: 'chinh-sua-dong-vat'};
        AuthService.duplicateFile(id, form, redirect)
    }
});

app.controller('VegetableManageController', ['$scope', '$http', 'AuthService', function ($scope, $http, AuthService) {
    
    $scope.link = 'thuc-vat';

    var url = AuthService.hostName + '/content/thuc-vat';
    $http.get(url).then(function (res) {
        $scope.data = res.data.vegetables;
        $scope.status = res.data.status;
        
    }, function (err) {
        console.log(err);
        $scope.status = res.data.status;
    });

    $scope.selectedAll = false;
    $scope.selectAll = function () {
        $scope.selectedAll = !$scope.selectedAll;
        var arr = document.getElementsByClassName("check-box");
        for (var i = arr.length - 1; i >= 0; i--) {
            arr[i].checked = $scope.selectedAll;
        }
    }

    $scope.duplicateFile = function (id, form) {
        var redirect = {sample: 'vegetable', link: 'chinh-sua-thuc-vat'};
        AuthService.duplicateFile(id, form, redirect)
    }

    $scope.approvePost = function (id, approved) {
        AuthService.approvePost(id, approved, 'thuc-vat')
    }
}]);

app.controller('LandManageController', ['$scope', '$http', 'AuthService', function ($scope, $http, AuthService) {
    $scope.link = 'tho-nhuong';
    var url = AuthService.hostName + '/content/tho-nhuong';
    $http.get(url).then(function (res) {
        $scope.data = res.data.soils;
        $scope.status = res.data.status;
        
    }, function (err) {
        console.log(err);
        $scope.status = res.data.status;
    });

    $scope.selectedAll = false;
    $scope.selectAll = function () {
        $scope.selectedAll = !$scope.selectedAll;
        var arr = document.getElementsByClassName("check-box");
        for (var i = arr.length - 1; i >= 0; i--) {
            arr[i].checked = $scope.selectedAll;
        }
    }

    $scope.duplicateFile = function (id, form) {
        var redirect = {sample: 'soil', link: 'chinh-sua-tho-nhuong'};
        AuthService.duplicateFile(id, form, redirect)
    }

    $scope.approvePost = function (id, approved) {
        AuthService.approvePost(id, approved, 'tho-nhuong')
    }
}]);
app.controller('GeologicalManageController', ['$scope', '$http', 'AuthService', function ($scope, $http, AuthService) {
    $scope.link = 'dia-chat';
    var url = AuthService.hostName + '/content/dia-chat';
    $http.get(url).then(function (res) {
        $scope.data = res.data.geologicals;
        $scope.status = res.data.status;
        
    }, function (err) {
        console.log(err);
        $scope.status = res.data.status;
    });

    $scope.selectedAll = false;
    $scope.selectAll = function () {
        $scope.selectedAll = !$scope.selectedAll;
        var arr = document.getElementsByClassName("check-box");
        for (var i = arr.length - 1; i >= 0; i--) {
            arr[i].checked = $scope.selectedAll;
        }
    }

    $scope.duplicateFile = function (id, form) {
        var redirect = {sample: 'geological', link: 'chinh-sua-dia-chat'};
        AuthService.duplicateFile(id, form, redirect)
    }

    $scope.approvePost = function (id, approved) {
        AuthService.approvePost(id, approved, 'dia-chat')
    }
}]);

app.controller('PaleontologicalManageController', ['$scope', '$http', 'AuthService', function ($scope, $http, AuthService) {
    $scope.link = 'co-sinh';
    var url = AuthService.hostName + '/content/co-sinh';
    $http.get(url).then(function (res) {
        $scope.data = res.data.paleontologicals;
        $scope.status = res.data.status;
        
    }, function (err) {
        console.log(err);
        $scope.status = res.data.status;
    });

    $scope.selectedAll = false;
    $scope.selectAll = function () {
        $scope.selectedAll = !$scope.selectedAll;
        var arr = document.getElementsByClassName("check-box");
        for (var i = arr.length - 1; i >= 0; i--) {
            arr[i].checked = $scope.selectedAll;
        }
    }

    $scope.duplicateFile = function (id, form) {
        var redirect = {sample: 'paleontological', link: 'chinh-sua-co-sinh'};
        AuthService.duplicateFile(id, form, redirect)
    }

    $scope.approvePost = function (id, approved) {
        AuthService.approvePost(id, approved, 'co-sinh')
    }
}]);

app.controller('ModalCtrl', function ($scope, $uibModal, AuthService) {

    $scope.showModal = function (id, link) {
        $scope.opts = {
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl: 'views/modals/delete.blade.html',
            controller: ModalInstanceCtrl,
            resolve: {
                fields: function () {
                    return ""
                }
            }
        };
        var url = AuthService.hostName + "/content/" + link;

        var modalInstance = $uibModal.open($scope.opts);
        modalInstance.result.then(function () {
            //on ok button press
            AuthService.deleteP(id, url);
        }, function () {
            //on cancel button press
        });
    };


});

var ModalInstanceCtrl = function ($scope, $uibModalInstance, $uibModal, $http, fields) {
    $scope.ok = function () {
        $uibModalInstance.close();
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    // fields export
    // console.log(fields);
    if (fields) {
        $scope.fields = fields;
    }

};

app.controller('ExportFileController', function ($scope, AuthService, $uibModal, $http) {
    setTimeout(function () {
        // get link to render fields export
        var x = document.getElementsByName('link');
        link = x[0].innerText
        var url = AuthService.hostName + "/content/" + link + '/fields';
        $http.get(url).then(function (res) {
            $scope.fields = res.data.fields
        }, function (err) {
            // log something
        })
    }, 1000)


    $scope.export = function (id) {
        $scope.opts = {
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl: 'views/modals/exportfile.blade.html',
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
})

// use for all manage
app.controller('ManageContentController', function ($scope, $http, AuthService, $state) {
    var url_direct  = $state.current.url;
    x = url_direct.split('/');
    $scope.link = x[x.length - 1];
    var url = AuthService.hostName + '/content/' + $scope.link;
    var dic = {
        "dong-vat": "animals",
        "thuc-vat": "vegetables",
        "co-sinh": "paleontologicals",
        "tho-nhuong": "soils",
        "dia-chat": "geologicals",
        "nam": "mycologies"
    }
    // map to params
    var sample = dic[$scope.link];


    $http.get(url).then(function (res) {
        $scope.data = res.data[sample];
        $scope.totalItems = $scope.data.length;
        // setTable();
    }, function (err) {
        console.log(err);
    });

    // pagination
    $scope.viewby = "10"; 
    
    $scope.currentPage = 4;
    $scope.itemsPerPage = $scope.viewby;
    $scope.maxSize = 5; //Number of pager buttons to show

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);
    };

    $scope.setItemsPerPage = function(num) {
      $scope.itemsPerPage = num;
      $scope.currentPage = 1; //reset to first page
    }

    $scope.selectedAll = false;
    $scope.selectAll = function () {
        $scope.selectedAll = !$scope.selectedAll;
        var arr = document.getElementsByClassName("check-box");
        for (var i = arr.length - 1; i >= 0; i--) {
            arr[i].checked = $scope.selectedAll;
        }
    }

    // Phe duyet mau
    $scope.approvePost = function (id, approved) {
        AuthService.approvePost(id, approved, $scope.link)
    }

    // Tao ban sao mau
    var sam = sample.slice(0, sample.length - 1)
    $scope.duplicateFile = function (id, form) {
        var redirect = {sample: sam, link: 'chinh-sua-' + $scope.link};
        AuthService.duplicateFile(id, form, redirect)
    }
});