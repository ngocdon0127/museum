app.controller('EditAnimalFormCtrl', ['$http', '$scope', 'AuthService', '$stateParams', '$timeout', 'cfpLoadingBar', function ($http, $scope, AuthService, $stateParams, $timeout, cfpLoadingBar) {
    var url = AuthService.hostName + '/content/dong-vat/' + $stateParams.id;
    $http.get('/app/database/tipsani.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    $scope.deleteTmpFile = function (file, field) {
        // var ob = document.getAttribute('data-file-name');
        var urlDelete = '/content/dong-vat/file'
        
        var data = {
            'form': document.getElementById("sample").value,
            'id': $stateParams.id,
            'randomStr': $scope.randomStr,
            'field': field,
            'fileName': file.fileName
        }
        AuthService.deleteTmpFile(data, urlDelete);
        // $scope.data[field].slice(key, 1);
        // $scope.$apply();
    }

    var keyid = navigator.userAgent + (new Date()).getTime().toString();
    $scope.randomStr = CryptoJS.MD5(keyid).toString();

    $scope.tab = 1;

    $scope.setTab = function (newTab) {
        $scope.tab = newTab;
    }

    $scope.isSet = function (tab) {
        return $scope.tab === tab
    }

    var arrAuto = AuthService.arrAuto;

    $http.get(AuthService.hostName + '/content/dong-vat/auto').then(function (res) {
        $scope.auto = res.data;
        setTimeout(function () {
            // Load name for input file
            $scope.getName = function (arr) {
                try {
                    fileName = arr.length ? arr[0].fileName : "No file chosen...";
                } catch (err) {
                    fileName = "No file chosen...";
                }
                return fileName;
            }
            arrAuto.forEach(function (val) {
                AuthService.autoCom(val, $scope);
            })
            // Fetch data to datalist
            AuthService.fetchFlexdatalist($scope);
        }, 200)
    }, function (err) {
        console.log(err);
    });

    $http.get(url).then(function (res) {
        $scope.data = res.data.animal;
        $scope.status = res.data.status;
        $scope.data.id = $stateParams.id;

        // DatePicker
        AuthService.initDatePicker($scope.data);

        $timeout(function () {
            if (isNaN($scope.data.viDo) && typeof $scope.data.viDo != "undefined") {
                var coor = $scope.data.viDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
                $scope.vido_do = parseInt(coor[1].trim());
                $scope.vido_phut = parseInt(coor[2].trim());
                $scope.vido_giay = parseInt(coor[3].trim());
                var coor = $scope.data.kinhDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
                $scope.kinhdo_do = parseInt(coor[1].trim());
                $scope.kinhdo_phut = parseInt(coor[2].trim());
                $scope.kinhdo_giay = parseInt(coor[3].trim());
                document.getElementById("vitri-dms").checked = true;
                $scope.showCoor = true;
            } else {
                document.getElementById("vitri-dd").checked = true;
                $scope.showCoor = false;
            }
            if ($scope.data.fDiaDiemThuMau == "bien") {
                document.getElementById("trenBien").checked = true;
            } else if ($scope.data.fDiaDiemThuMau == "dao") {
                document.getElementById("dao").checked = true;
            } else {
                document.getElementById("datLien").checked = true;
            }
        }, 500);
    }, function (err) {
        $scope.status = err.data.status;
    });

    var urlRe = 'quan-ly-dong-vat';
    $scope.updatePost = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.editForm(fd, AuthService.hostName + '/content/dong-vat', urlRe);
    }
    $scope.saveAs = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/dong-vat', urlRe);
    }

    //coordinate change
    $scope.latChange = function () {
        $scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
    }
    $scope.lonChange = function () {
        $scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
    }

    $scope.dms = function () {
        $scope.showCoor = true;
    }
    $scope.dd = function () {
        $scope.showCoor = false
    }
}]);

app.controller('EditPaleontologicalFormCtrl', ['$http', '$scope', 'AuthService', '$stateParams', '$timeout', 'cfpLoadingBar', function ($http, $scope, AuthService, $stateParams, $timeout, cfpLoadingBar) {
    var url = AuthService.hostName + '/content/co-sinh/' + $stateParams.id;

    $http.get('/app/database/tipspal.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    var keyid = navigator.userAgent + (new Date()).getTime().toString();
    $scope.randomStr = CryptoJS.MD5(keyid).toString();

    $scope.tab = 1;

    $scope.setTab = function (newTab) {
        $scope.tab = newTab;
    }

    $scope.isSet = function (tab) {
        return $scope.tab === tab
    }

    var arrAuto = AuthService.arrAuto;

    $http.get(AuthService.hostName + '/content/co-sinh/auto').then(function (res) {
        $scope.auto = res.data;
        setTimeout(function () {
            // Load name for input file
            $scope.getName = function (arr) {
                try {
                    fileName = arr.length ? arr[0].fileName : "No file chosen...";
                } catch (err) {
                    fileName = "No file chosen...";
                }
                return fileName;
            }

            arrAuto.forEach(function (val) {
                AuthService.autoCom(val, $scope);
            })
            // Fetch data to datalist
            AuthService.fetchFlexdatalist($scope);
        }, 200)
    }, function (err) {
        console.log(err);
    });

    $http.get(url).then(function (res) {
        $scope.data = res.data.paleontological;
        $scope.status = res.data.status;
        $scope.data.id = $stateParams.id;

        // DatePicker
        AuthService.initDatePicker($scope.data);

        $timeout(function () {
            if (isNaN($scope.data.viDo) && typeof $scope.data.viDo != "undefined") {
                var coor = $scope.data.viDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
                $scope.vido_do = parseInt(coor[1].trim());
                $scope.vido_phut = parseInt(coor[2].trim());
                $scope.vido_giay = parseInt(coor[3].trim());
                var coor = $scope.data.kinhDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
                $scope.kinhdo_do = parseInt(coor[1].trim());
                $scope.kinhdo_phut = parseInt(coor[2].trim());
                $scope.kinhdo_giay = parseInt(coor[3].trim());
                document.getElementById("vitri-dms").checked = true;
                $scope.showCoor = true;
            } else {
                document.getElementById("vitri-dd").checked = true;
                $scope.showCoor = false;
            }
            if ($scope.data.fDiaDiemThuMau == "bien") {
                document.getElementById("trenBien").checked = true;
            } else if ($scope.data.fDiaDiemThuMau == "dao") {
                document.getElementById("dao").checked = true;
            } else {
                document.getElementById("datLien").checked = true;
            }
        }, 500);
    }, function (err) {
        $scope.status = err.data.status;
    });

    var urlRe = 'quan-ly-co-sinh';
    $scope.updatePost = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.editForm(fd, AuthService.hostName + '/content/co-sinh', urlRe);
    }

    $scope.saveAs = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/co-sinh', urlRe);
    }

    //coordinate change
    $scope.latChange = function () {
        $scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
    }
    $scope.lonChange = function () {
        $scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
    }

    $scope.dms = function () {
        $scope.showCoor = true;
    }
    $scope.dd = function () {
        $scope.showCoor = false
    }
}]);

app.controller('EditVegetableFormCtrl', ['$http', '$scope', 'AuthService', '$stateParams', '$timeout', 'cfpLoadingBar', function ($http, $scope, AuthService, $stateParams, $timeout, cfpLoadingBar) {
    var url = AuthService.hostName + '/content/thuc-vat/' + $stateParams.id;

    $http.get('/app/database/tipsveg.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    var keyid = navigator.userAgent + (new Date()).getTime().toString();
    $scope.randomStr = CryptoJS.MD5(keyid).toString();

    $scope.tab = 1;

    $scope.setTab = function (newTab) {
        $scope.tab = newTab;
    }

    $scope.isSet = function (tab) {
        return $scope.tab === tab
    }

    var arrAuto = AuthService.arrAuto;

    $http.get(AuthService.hostName + '/content/thuc-vat/auto').then(function (res) {
        $scope.auto = res.data;
        setTimeout(function () {
            // Load name for input file
            $scope.getName = function (arr) {
                try {
                    fileName = arr.length ? arr[0].fileName : "No file chosen...";
                } catch (err) {
                    fileName = "No file chosen...";
                }
                return fileName;
            }

            arrAuto.forEach(function (val) {
                AuthService.autoCom(val, $scope);
            })
            // Fetch data to datalist
            AuthService.fetchFlexdatalist($scope);
        }, 200)
    }, function (err) {
        console.log(err);
    });

    $http.get(url).then(function (res) {
        $scope.data = res.data.vegetable;
        $scope.status = res.data.status;
        $scope.data.id = $stateParams.id;

        // DatePicker
        AuthService.initDatePicker($scope.data);

        $timeout(function () {
            if (isNaN($scope.data.viDo) && typeof $scope.data.viDo != "undefined") {
                var coor = $scope.data.viDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
                $scope.vido_do = parseInt(coor[1].trim());
                $scope.vido_phut = parseInt(coor[2].trim());
                $scope.vido_giay = parseInt(coor[3].trim());
                var coor = $scope.data.kinhDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
                $scope.kinhdo_do = parseInt(coor[1].trim());
                $scope.kinhdo_phut = parseInt(coor[2].trim());
                $scope.kinhdo_giay = parseInt(coor[3].trim());
                document.getElementById("vitri-dms").checked = true;
                $scope.showCoor = true;
            } else {
                document.getElementById("vitri-dd").checked = true;
                $scope.showCoor = false;
            }
            if ($scope.data.fDiaDiemThuMau == "bien") {
                document.getElementById("trenBien").checked = true;
            } else {
                document.getElementById("datLien").checked = true;
            }
        }, 500);
    }, function (err) {
        $scope.status = err.data.status;
    });

    var urlRe = 'quan-ly-thuc-vat';
    $scope.updatePost = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.editForm(fd, AuthService.hostName + '/content/thuc-vat', urlRe);
    }

    $scope.saveAs = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/thuc-vat', urlRe);
    }

    //coordinate change
    $scope.latChange = function () {
        $scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
    }
    $scope.lonChange = function () {
        $scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
    }

    $scope.dms = function () {
        $scope.showCoor = true;
    }
    $scope.dd = function () {
        $scope.showCoor = false
    }
}]);

app.controller('EditGeologicalFormCtrl', ['$http', '$scope', 'AuthService', '$stateParams', '$timeout', 'cfpLoadingBar', function ($http, $scope, AuthService, $stateParams, $timeout, cfpLoadingBar) {
    var url = AuthService.hostName + '/content/dia-chat/' + $stateParams.id;

    $http.get('/app/database/tipsgeo.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    var keyid = navigator.userAgent + (new Date()).getTime().toString();
    $scope.randomStr = CryptoJS.MD5(keyid).toString();

    $scope.tab = 1;

    $scope.setTab = function (newTab) {
        $scope.tab = newTab;
    }

    $scope.isSet = function (tab) {
        return $scope.tab === tab
    }

    var arrAuto = AuthService.arrAuto;

    $http.get(AuthService.hostName + '/content/dia-chat/auto').then(function (res) {
        $scope.auto = res.data;
        setTimeout(function () {
            // Load name for input file
            $scope.getName = function (arr) {
                try {
                    fileName = arr.length ? arr[0].fileName : "No file chosen...";
                } catch (err) {
                    fileName = "No file chosen...";
                }
                return fileName;
            }

            arrAuto.forEach(function (val) {
                AuthService.autoCom(val, $scope);
            })
            // Fetch data to datalist
            AuthService.fetchFlexdatalist($scope);
        }, 200)
    }, function (err) {
        console.log(err);
    });

    $http.get(url).then(function (res) {

        $scope.data = res.data.geological;
        $scope.status = res.data.status;
        $scope.data.id = $stateParams.id;

        // DatePicker
        AuthService.initDatePicker($scope.data);

        $timeout(function () {
            if (isNaN($scope.data.viDo) && typeof $scope.data.viDo != "undefined") {
                var coor = $scope.data.viDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
                try {
                    $scope.vido_do = parseInt(coor[1].trim());
                    $scope.vido_phut = parseInt(coor[2].trim());
                    $scope.vido_giay = parseInt(coor[3].trim());
                    var coor = $scope.data.kinhDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
                    $scope.kinhdo_do = parseInt(coor[1].trim());
                    $scope.kinhdo_phut = parseInt(coor[2].trim());
                    $scope.kinhdo_giay = parseInt(coor[3].trim());
                } catch (e) {
                    console.log(e)
                }
                document.getElementById("vitri-dms").checked = true;
                $scope.showCoor = true;
            } else {
                document.getElementById("vitri-dd").checked = true;
                $scope.showCoor = false;
            }
            if ($scope.data.fDiaDiemThuMau == "bien") {
                document.getElementById("trenBien").checked = true;
            } else {
                document.getElementById("datLien").checked = true;
            }
        }, 500);
    }, function (err) {
        $scope.status = err.data.status;
    });

    var urlRe = 'quan-ly-dia-chat';
    $scope.updatePost = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.editForm(fd, AuthService.hostName + '/content/dia-chat', urlRe);
    }

    $scope.saveAs = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/dia-chat', urlRe);
    }

    //coordinate change
    $scope.latChange = function () {
        $scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
    }
    $scope.lonChange = function () {
        $scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
    }

    $scope.dms = function () {
        $scope.showCoor = true;
    }
    $scope.dd = function () {
        $scope.showCoor = false
    }
}]);

app.controller('EditLandFormCtrl', ['$http', '$scope', 'AuthService', '$stateParams', '$timeout', 'cfpLoadingBar', function ($http, $scope, AuthService, $stateParams, $timeout, cfpLoadingBar) {
    var url = AuthService.hostName + '/content/tho-nhuong/' + $stateParams.id;

    $http.get('/app/database/tipslan.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    var keyid = navigator.userAgent + (new Date()).getTime().toString();
    $scope.randomStr = CryptoJS.MD5(keyid).toString();

    $scope.tab = 1;

    $scope.setTab = function (newTab) {
        $scope.tab = newTab;
    }

    $scope.isSet = function (tab) {
        return $scope.tab === tab
    }

    var arrAuto = AuthService.arrAuto;

    $http.get(AuthService.hostName + '/content/tho-nhuong/auto').then(function (res) {
        $scope.auto = res.data;
        setTimeout(function () {
            // Load name for input file
            $scope.getName = function (arr) {
                try {
                    fileName = arr.length ? arr[0].fileName : "No file chosen...";
                } catch (err) {
                    fileName = "No file chosen...";
                }
                return fileName;
            }

            arrAuto.forEach(function (val) {
                AuthService.autoCom(val, $scope);
            })
            // Fetch data to datalist
            AuthService.fetchFlexdatalist($scope);
        }, 200)
    }, function (err) {
        console.log(err);
    });

    $http.get(url).then(function (res) {
        $scope.data = res.data.soil;
        $scope.status = res.data.status;
        $scope.data.id = $stateParams.id;

        // DatePicker
        AuthService.initDatePicker($scope.data);

        $timeout(function () {
            if (isNaN($scope.data.viDo) && typeof $scope.data.viDo != "undefined") {
                var coor = $scope.data.viDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
                $scope.vido_do = parseInt(coor[1].trim());
                $scope.vido_phut = parseInt(coor[2].trim());
                $scope.vido_giay = parseInt(coor[3].trim());
                var coor = $scope.data.kinhDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
                $scope.kinhdo_do = parseInt(coor[1].trim());
                $scope.kinhdo_phut = parseInt(coor[2].trim());
                $scope.kinhdo_giay = parseInt(coor[3].trim());
                document.getElementById("vitri-dms").checked = true;
                $scope.showCoor = true;
            } else {
                document.getElementById("vitri-dd").checked = true;
                $scope.showCoor = false;
            }
            if ($scope.data.fDiaDiemThuMau == "bien") {
                document.getElementById("trenBien").checked = true;
            } else {
                document.getElementById("datLien").checked = true;
            }
            // }
        }, 500);
    }, function (err) {
        $scope.status = err.data.status;
    });

    var urlRe = 'quan-ly-tho-nhuong';
    $scope.updatePost = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.editForm(fd, AuthService.hostName + '/content/tho-nhuong', urlRe);
    }

    $scope.saveAs = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/tho-nhuong', urlRe);
    }

    //coordinate change
    $scope.latChange = function () {
        $scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
    }
    $scope.lonChange = function () {
        $scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
    }

    $scope.dms = function () {
        $scope.showCoor = true;
    }
    $scope.dd = function () {
        $scope.showCoor = false
    }
}]);
