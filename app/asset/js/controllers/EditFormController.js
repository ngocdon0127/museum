var error_fields = [
    [
        "soHieuBTTNVN",
        "soHieuBaoTangCS",
        "soHieuThucDia",
        "kyHieuMauVatKhac",
        "thongTinKhac1Str",
        "thongTinKhac1File"
    ],
    [
        "tenDongNghia",
        "gioi",
        "nganh",
        "lop",
        "phanLop",
        "bo",
        "phanBo",
        "lienHo",
        "ho",
        "phanHo",
        "toc",
        "tong",
        "chiGiong",
        "phanChiPhanGiong",
        "loai",
        "duoiLoai",
        "nguoiDinhTen",
        "ngayDinhTen",
        "tenVietNam",
        "tenDiaPhuong",
        "tenTiengAnh",
        "tenTheoQuocTe",
        "tenTheoBaoTang",
        "thongTinKhac2Str",
        "thongTinKhac2File"
    ],
    [
        "soLuongTieuBan",
        "loaiMauVat",
        "chieuDai",
        "donVi_chieuDai",
        "chieuRong",
        "donVi_chieuRong",
        "chieuCao",
        "donVi_chieuCao",
        "theTich",
        "donVi_theTich",
        "trongLuong",
        "donVi_trongLuong",
        "tinhTrangMau",
        "thongTinKhac3Str",
        "thongTinKhac3File"
    ],
    [
        "thoiGianThuMau",
        "nguoiThuMau",
        "coQuanThuMau",
        "phuongPhapThuMau",
        "quocGia",
        "tinh",
        "tinhKhac",
        "huyen",
        "xa",
        "thon",
        "viDo",
        "kinhDo",
        "mauChatOViTriThuMau",
        "doCao",
        "doSau",
        "doDocNoiThuMau",
        "mucNuocNgamNoiThuMau",
        "khaNangThoatNuoc",
        "thoiTietKhiThuMau",
        "dangDiaHinhNoiThuMau",
        "thamThucVatNoiThuMau",
        "vungBien",
        "sinhHoc",
        "thongTinDuAn",
        "ghiChepThucDia",
        "banDo",
        "thongTinKhac4Str",
        "thongTinKhac4File"
    ],
    [
        "ngayPhanTichMauDat",
        "hoSoPhanTichMauDat",
        "ketQuaPhanTich",
        "thoiGianGiamDinh",
        "nguoiGiamDinh",
        "coQuanToChucGiamDinh",
        "taiLieuPhanTichStr",
        "taiLieuPhanTichFile",
        "moTaHinhThaiStr",
        "moTaHinhThaiFile",
        "phanTichQuangHocStr",
        "phanTichQuangHocFile",
        "ketQuaThanhPhanVatChat",
        "ketQuaPhanTichDinhTuoi",
        "dacDiemViCauTruc",
        "dacDiemLatMong",
        "phanTichKhac",
        "dacDiemDiaChat",
        "loaiHinhNguonGoc",
        "gioiTinh",
        "giaiDoanSong",
        "hinhVe",
        "thongTinKhac5Str",
        "thongTinKhac5File"
    ],
    [
        "anhMauVat",
        "hinhAnhNgoaiThucDia",
        "videoStr",
        "videoFile",
        "hinhAnhDinhKem",
        "dinhKemXuLyCheTac",
        "thuocTinhXuLyCheTac",
        "phuongThucXuLy",
        "thoiGianXuLy",
        "nguoiXuLy",
        "coQuanXuLy",
        "viTriLayMauDNA",
        "mauDNA",
        "thongTinMauHatPhan",
        "anhMauSauCheTac",
        "taiLieuDiKem",
        "boPhanLayMauDNA",
        "trangThaiGiuMauDNA",
        "vungGenPhanTich",
        "dinhKemTrinhTuDNA",
        "congBoQuocTe",
        "thongTinKhac6Str",
        "thongTinKhac6File"
    ],
    [
        "loaiMau",
        "hinhDangMauTonTai",
        "mauSac",
        "phanLoaiSuDungMau",
        "thanhPhanKhoangVat",
        "tinhChatVatLy",
        "congThucHoaHocStr",
        "congThucHoaHocFile",
        "thanhPhanHoaHoc",
        "phanBoVietNamStr",
        "phanBoVietNamFile",
        "phanBoTrenTheGioiStr",
        "phanBoTrenTheGioiFile",
        "giaTriSuDung",
        "thongTinKhac7Str",
        "thongTinKhac7File"
    ],
    [
        "ngayNhapMau",
        "nguoiGiao",
        "nguoiNhan",
        "coQuanNhapVatMau",
        "hinhThucNhapMau",
        "traoDoiMau",
        "vayMuon",
        "noiLuuTruMau",
        "phong",
        "tuGia",
        "ngan",
        "hop",
        "giayPhepNhapMau",
        "hoSoNhapMauVatDiKem",
        "nguoiLapPhieuMauVat",
        "nguoiNhapVaoPhanMem",
        "thongTinKhac8Str",
        "thongTinKhac8File"
    ],
    [
        "thongTinKhac9Str",
        "thongTinKhac9File"
    ]
]

app.controller('EditAnimalFormCtrl', function ($http, $scope, AuthService, $stateParams, $timeout, cfpLoadingBar) {
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
                var do_phut_giay = $scope.data.viDo.split("°");
                $scope.data.viDo_do = parseInt(do_phut_giay[0].trim());
                phut_giay = do_phut_giay[1].split("'");
                $scope.data.viDo_phut = parseInt(phut_giay[0].trim());
                giay = phut_giay[1].split("\"");
                $scope.data.viDo_giay = parseInt(giay[0].trim());

                var do_phut_giay = $scope.data.kinhDo.split("°");
                $scope.data.kinhDo_do = parseInt(do_phut_giay[0].trim());
                phut_giay = do_phut_giay[1].split("'");
                $scope.data.kinhDo_phut = parseInt(phut_giay[0].trim());
                giay = phut_giay[1].split("\"");
                $scope.data.kinhDo_giay = parseInt(giay[0].trim());
                $scope.data.fViTriToaDo = 'dms';
            } else {
                $scope.data.fViTriToaDo = 'dd';
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
        AuthService.editForm(fd, AuthService.hostName + '/content/dong-vat', urlRe).then(function success(data) {
            // console.log(data);
        }, function error(err) {
            // console.log(err.responseJSON.field);
            for (var i = 0; i < error_fields.length; i++) {
                if (error_fields[i].indexOf(err.responseJSON.field) != -1) {
                    $scope.tab = i+1;
                    // console.log(i);
                    // console.log($scope.tab);
                    break;
                }
            }
        });
    }
    $scope.saveAs = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/dong-vat', urlRe);
    }
});

app.controller('EditPaleontologicalFormCtrl', function ($http, $scope, AuthService, $stateParams, $timeout, cfpLoadingBar) {
    var url = AuthService.hostName + '/content/co-sinh/' + $stateParams.id;

    $http.get('/app/database/tipspal.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    $scope.deleteTmpFile = function (file, field) {
        // var ob = document.getAttribute('data-file-name');
        var urlDelete = '/content/co-sinh/file'
        
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
                var do_phut_giay = $scope.data.viDo.split("°");
                $scope.data.viDo_do = parseInt(do_phut_giay[0].trim());
                phut_giay = do_phut_giay[1].split("'");
                $scope.data.viDo_phut = parseInt(phut_giay[0].trim());
                giay = phut_giay[1].split("\"");
                $scope.data.viDo_giay = parseInt(giay[0].trim());

                var do_phut_giay = $scope.data.kinhDo.split("°");
                $scope.data.kinhDo_do = parseInt(do_phut_giay[0].trim());
                phut_giay = do_phut_giay[1].split("'");
                $scope.data.kinhDo_phut = parseInt(phut_giay[0].trim());
                giay = phut_giay[1].split("\"");
                $scope.data.kinhDo_giay = parseInt(giay[0].trim());
                $scope.data.fViTriToaDo = 'dms';
            } else {
                $scope.data.fViTriToaDo = 'dd';
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
        AuthService.editForm(fd, AuthService.hostName + '/content/co-sinh', urlRe).then(function success(data) {
            // console.log(data);
        }, function error(err) {
            // console.log(err.responseJSON.field);
            for (var i = 0; i < error_fields.length; i++) {
                if (error_fields[i].indexOf(err.responseJSON.field) != -1) {
                    $scope.tab = i+1;
                    // console.log(i);
                    // console.log($scope.tab);
                    break;
                }
            }
        });
    }

    $scope.saveAs = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/co-sinh', urlRe);
    }
});

app.controller('EditVegetableFormCtrl', function ($http, $scope, AuthService, $stateParams, $timeout, cfpLoadingBar) {
    var url = AuthService.hostName + '/content/thuc-vat/' + $stateParams.id;

    $http.get('/app/database/tipsveg.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    $scope.deleteTmpFile = function (file, field) {
        // var ob = document.getAttribute('data-file-name');
        var urlDelete = '/content/thuc-vat/file'
        
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
                var do_phut_giay = $scope.data.viDo.split("°");
                $scope.data.viDo_do = parseInt(do_phut_giay[0].trim());
                phut_giay = do_phut_giay[1].split("'");
                $scope.data.viDo_phut = parseInt(phut_giay[0].trim());
                giay = phut_giay[1].split("\"");
                $scope.data.viDo_giay = parseInt(giay[0].trim());

                var do_phut_giay = $scope.data.kinhDo.split("°");
                $scope.data.kinhDo_do = parseInt(do_phut_giay[0].trim());
                phut_giay = do_phut_giay[1].split("'");
                $scope.data.kinhDo_phut = parseInt(phut_giay[0].trim());
                giay = phut_giay[1].split("\"");
                $scope.data.kinhDo_giay = parseInt(giay[0].trim());
                $scope.data.fViTriToaDo = 'dms';
            } else {
                $scope.data.fViTriToaDo = 'dd';
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
        AuthService.editForm(fd, AuthService.hostName + '/content/thuc-vat', urlRe).then(function success(data) {
            // console.log(data);
        }, function error(err) {
            // console.log(err.responseJSON.field);
            for (var i = 0; i < error_fields.length; i++) {
                if (error_fields[i].indexOf(err.responseJSON.field) != -1) {
                    $scope.tab = i+1;
                    // console.log(i);
                    // console.log($scope.tab);
                    break;
                }
            }
        });
    }

    $scope.saveAs = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/thuc-vat', urlRe);
    }
});

app.controller('EditGeologicalFormCtrl', function ($http, $scope, AuthService, $stateParams, $timeout, cfpLoadingBar) {
    var url = AuthService.hostName + '/content/dia-chat/' + $stateParams.id;

    $http.get('/app/database/tipsgeo.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    $scope.deleteTmpFile = function (file, field) {
        // var ob = document.getAttribute('data-file-name');
        var urlDelete = '/content/dia-chat/file'
        
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
                var do_phut_giay = $scope.data.viDo.split("°");
                $scope.data.viDo_do = parseInt(do_phut_giay[0].trim());
                phut_giay = do_phut_giay[1].split("'");
                $scope.data.viDo_phut = parseInt(phut_giay[0].trim());
                giay = phut_giay[1].split("\"");
                $scope.data.viDo_giay = parseInt(giay[0].trim());

                var do_phut_giay = $scope.data.kinhDo.split("°");
                $scope.data.kinhDo_do = parseInt(do_phut_giay[0].trim());
                phut_giay = do_phut_giay[1].split("'");
                $scope.data.kinhDo_phut = parseInt(phut_giay[0].trim());
                giay = phut_giay[1].split("\"");
                $scope.data.kinhDo_giay = parseInt(giay[0].trim());
                $scope.data.fViTriToaDo = 'dms';
            } else {
                $scope.data.fViTriToaDo = 'dd';
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
        AuthService.editForm(fd, AuthService.hostName + '/content/dia-chat', urlRe).then(function success(data) {
            // console.log(data);
        }, function error(err) {
            // console.log(err.responseJSON.field);
            for (var i = 0; i < error_fields.length; i++) {
                if (error_fields[i].indexOf(err.responseJSON.field) != -1) {
                    $scope.tab = i+1;
                    // console.log(i);
                    // console.log($scope.tab);
                    break;
                }
            }
        });
    }

    $scope.saveAs = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/dia-chat', urlRe);
    }
});

app.controller('EditLandFormCtrl', function ($http, $scope, AuthService, $stateParams, $timeout, cfpLoadingBar) {
    var url = AuthService.hostName + '/content/tho-nhuong/' + $stateParams.id;

    $http.get('/app/database/tipslan.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    $scope.deleteTmpFile = function (file, field) {
        // var ob = document.getAttribute('data-file-name');
        var urlDelete = '/content/tho-nhuong/file'
        
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
                var do_phut_giay = $scope.data.viDo.split("°");
                $scope.data.viDo_do = parseInt(do_phut_giay[0].trim());
                phut_giay = do_phut_giay[1].split("'");
                $scope.data.viDo_phut = parseInt(phut_giay[0].trim());
                giay = phut_giay[1].split("\"");
                $scope.data.viDo_giay = parseInt(giay[0].trim());

                var do_phut_giay = $scope.data.kinhDo.split("°");
                $scope.data.kinhDo_do = parseInt(do_phut_giay[0].trim());
                phut_giay = do_phut_giay[1].split("'");
                $scope.data.kinhDo_phut = parseInt(phut_giay[0].trim());
                giay = phut_giay[1].split("\"");
                $scope.data.kinhDo_giay = parseInt(giay[0].trim());
                $scope.data.fViTriToaDo = 'dms';
            } else {
                $scope.data.fViTriToaDo = 'dd';
            }
        }, 500);
    }, function (err) {
        $scope.status = err.data.status;
    });

    var urlRe = 'quan-ly-tho-nhuong';
    $scope.updatePost = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.editForm(fd, AuthService.hostName + '/content/tho-nhuong', urlRe).then(function success(data) {
            // console.log(data);
        }, function error(err) {
            console.log(err.responseJSON.field);
            for (var i = 0; i < error_fields.length; i++) {
                if (error_fields[i].indexOf(err.responseJSON.field) != -1) {
                    $scope.tab = i+1;
                    // console.log(i);
                    // console.log($scope.tab);
                    break;
                }
            }
        });
    }

    $scope.saveAs = function () {
        cfpLoadingBar.start();
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/tho-nhuong', urlRe);
    }
});