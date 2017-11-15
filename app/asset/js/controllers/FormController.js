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

async function sheetToJson(workbook, urlFields, urlDates, row) {
    // create a Form data to put data
    var result = {};
    var dic;
    var data;
    var datefields;
    await workbook.SheetNames.forEach(function (sheetName) {
        if (sheetName == "Mau Hang") {
        dic = workbook.Sheets[sheetName];
        }
    });

    await $.get(urlDates).then(function success(res) {
        datefields = res;
    }, function error(err) {
        console.log(err);
    });
    await $.get(urlFields).then(function success(res) {
        data = res;
    }, function error(err) {
        console.log(err);
    });
    await data.forEach(function (element) {
        try {
            var typeData = dic
            var _tmp = dic[element[1] + row];
            var prop = dic[element[0]]["h"];
            if (typeof (_tmp) !== "undefined") {
                if (_tmp["t"] == "n") {
                    result[prop] = _tmp["v"];
                } else {
                    result[prop] = _tmp["h"].trim();
                }
            } else {
                result[prop] = "";
            }
        } catch (e) {
            // console.log(e);
        }
    });

    await datefields.forEach(function (element) {
        var ngay = element + "_ngay";
        var thang = element + "_thang";
        var nam = element + "_nam";
        var dat = [result[ngay] + "/", result[thang] + "/", result[nam]]
        result[element] = "";
        for (var i = 0; i < dat.length; i++) {
            if (dat[i] != "/") {
                result[element] += dat[i];
            }
        }
    })
    document.getElementById('fLoadFromXLSX').value = 1; // mark that this sample is loaded from file
    return result;
}

function initDefaultUnits(_scope) {
    setTimeout((function (_scope) {
        return function () {
            var donVis = [
                {
                    field: 'chieuCao',
                    unitField: 'donVi_chieuCao',
                    defaultValue: 'm'
				},
                {
                    field: 'chieuRong',
                    unitField: 'donVi_chieuRong',
                    defaultValue: 'm'
				},
                {
                    field: 'chieuDai',
                    unitField: 'donVi_chieuDai',
                    defaultValue: 'm'
				},
                {
                    field: 'trongLuong',
                    unitField: 'donVi_trongLuong',
                    defaultValue: 'kg'
				},
                {
                    field: 'theTich',
                    unitField: 'donVi_theTich',
                    defaultValue: 'l'
                },
                {
                    unitField: 'date_ndt',
                    defaultValue: 'dd/mm/yyyy'
                },
                {
                    unitField: 'date_tgtm',
                    defaultValue: 'dd/mm/yyyy'
                },
                {
                    unitField: 'date_tgpt',
                    defaultValue: 'dd/mm/yyyy'
                },
                {
                    unitField: 'date_tgct',
                    defaultValue: 'dd/mm/yyyy'
                },
                {
                    unitField: 'date_nnm',
                    defaultValue: 'dd/mm/yyyy'
                },
                {
                    unitField: 'date_ptmd',
                    defaultValue: 'dd/mm/yyyy'
                },
                {
                    unitField: 'date_tggd',
                    defaultValue: 'dd/mm/yyyy'
				}
			]
            if (!_scope.data) {
                _scope.data={}
            }
            donVis.map(function (donVi) {
                _scope.data[donVi.unitField] = donVi.defaultValue;
            })
        }
    })(_scope), 200);
}

function saveData(id, data) {
    return function () {
        localStorage.setItem(id, JSON.stringify(data))
    }
}

app.controller('AnimalFormCtrl', function ($scope, $http, AuthService, $interval, $timeout) {

    // Sinh key cho tu dong upload
    var keyid = navigator.userAgent + (new Date()).getTime().toString();
    $scope.randomStr = CryptoJS.MD5(keyid).toString();

    $http.get('/app/database/tipsani.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    $scope.tab = 1;

    $scope.setTab = function (newTab) {
        $scope.tab = newTab;
    }

    $scope.isSet = function (tab) {
        return $scope.tab === tab
    }

    // default unit
    initDefaultUnits($scope);

    // render flexdatalist
    AuthService.renderFlexdatalist()

    // DatePicker
    AuthService.initDatePicker(null, null);

    $scope.read = function (respone) {
        var urlFields = "/app/database/templateexcel/templateAni.json"
        var urlDates = "/app/database/templateexcel/anidate.json"
        var row = prompt("Nhập số thứ tự của mẫu: ")
        // console.log(row);
        var result = sheetToJson(respone, urlFields, urlDates, parseInt(row) + 12)
        result.then(function success(res_tmp) {
            $scope.data = res_tmp;
            console.log($scope.data);
            console.log($scope.data.fViTriToaDo);
            $timeout(function () {
                if ($scope.data.fViTriToaDo == "DMS") {
                    console.log("Don vi la dms");
                    $scope.data.fViTriToaDo = "dms";
                    $scope.data.viDo = res_tmp.viDo_do + " ° " + res_tmp.viDo_phut + " ' " + res_tmp.viDo_giay + '"';
                    $scope.data.kinhDo = res_tmp.kinhDo_do + " ° " + res_tmp.kinhDo_phut + " ' " + res_tmp.kinhDo_giay + '"';
                } else {
                    console.log("Don vi la dd");
                    $scope.data.fViTriToaDo = "dd";
                }
            }, 500);
            $scope.$apply();
        })
    }

    $scope.error = function (e) {
        console.log(e);
    }

    //auto complete
    var arrAuto = AuthService.arrAuto;

    $http.get(AuthService.hostName + '/content/dong-vat/auto').then(function (res) {
        $scope.auto = res.data;
        // console.log(res.data);
        arrAuto.forEach(function (val) {
            AuthService.autoCom(val, $scope);
        })
    }, function (err) {
        console.log(err);
    });
    //name of route, config in app.config.js file
    var urlRe = 'quan-ly-dong-vat';

    $scope.addPost = function (FormContent) {

        //Bắt lỗi valid dưới client
        // if ($scope.FormContent.$valid) {
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/dong-vat', urlRe).then(function success(data) {
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
        // } else{
        // 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
        // }
    }

    saveData = $interval(function () {
        localStorage.setItem("dataAnimal", JSON.stringify($scope.data))
    }, 900000)

    $scope.saveCookies = function () {
        localStorage.setItem("dataAnimal", JSON.stringify($scope.data))
    }
    $scope.getCookies = function () {
        $scope.data = JSON.parse(localStorage.getItem("dataAnimal"))
    }
});

app.controller('VegetableFormCtrl', function ($scope, $http, AuthService, $interval, $timeout) {

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
    };

    $scope.isSet = function (tab) {
        return $scope.tab === tab;
    };

    // default unit
    initDefaultUnits($scope);
    
    // render flexdatalist
    AuthService.renderFlexdatalist()

    // DatePicker
    AuthService.initDatePicker(null, null);

    var arrAuto = AuthService.arrAuto;
    $http.get(AuthService.hostName + '/content/thuc-vat/auto').then(function (res) {
        $scope.auto = res.data;
        arrAuto.forEach(function (val) {
            AuthService.autoCom(val, $scope);
        })
    }, function (err) {
        console.log(err);
    });

    $scope.read = function (respone) {
        var urlFields = "/app/database/templateexcel/templateVeg.json"
        var urlDates = "/app/database/templateexcel/vegdate.json"
         var row = prompt("Nhập số thứ tự của mẫu: ")
        var result = sheetToJson(respone, urlFields, urlDates, parseInt(row) + 12)
        result.then(function success(res_tmp) {
            $scope.data = res_tmp;
            // console.log(res_tmp);
            $timeout(function () {
                if ($scope.data.fViTriToaDo == "DMS") {
                    $scope.data.fViTriToaDo = "dms";
                    $scope.data.viDo = res_tmp.viDo_do + " ° " + res_tmp.viDo_phut + " ' " + res_tmp.viDo_giay + '"';
                    $scope.data.kinhDo = res_tmp.kinhDo_do + " ° " + res_tmp.kinhDo_phut + " ' " + res_tmp.kinhDo_giay + '"';
                } else {
                    $scope.data.fViTriToaDo = "dd";
                }
            }, 100);
            $scope.$apply();
        })
    }

    $scope.error = function (e) {
        console.log(e);
    }

    //name of route, config in app.config.js file
    var urlRe = 'quan-ly-thuc-vat';

    $scope.addPost = function (FormContent) {
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        console.log(fd);
        AuthService.addSample(fd, AuthService.hostName + '/content/thuc-vat', urlRe).then(function success(data) {
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
        });;
    }

    saveData = $interval(function () {
        localStorage.setItem("dataVeg", JSON.stringify($scope.data))
    }, 900000)

    $scope.saveCookies = function () {
        localStorage.setItem("dataVeg", JSON.stringify($scope.data))
    }
    $scope.getCookies = function () {
        $scope.data = JSON.parse(localStorage.getItem("dataVeg"))
    }
});

app.controller('GeologicalFormCtrl', function ($scope, $http, AuthService, $interval, $timeout) {

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
    };

    $scope.isSet = function (tab) {
        return $scope.tab === tab
    };

    // default unit
    initDefaultUnits($scope);

    // render flexdatalist
    AuthService.renderFlexdatalist();

    // DatePicker
    AuthService.initDatePicker(null, null);

    $scope.read = function (respone) {
        var urlFields = "/app/database/templateexcel/templateGeo.json"
        var urlDates = "/app/database/templateexcel/geodate.json"
        var row = prompt("Nhập số thứ tự của mẫu: ")
        // console.log(row);
        var result = sheetToJson(respone, urlFields, urlDates, parseInt(row) + 12)
        result.then(function success(res_tmp) {
            $scope.data = res_tmp;
            // console.log(res_tmp);
            $timeout(function () {
                if ($scope.data.fViTriToaDo == "DMS") {
                        $scope.data.fViTriToaDo = "dms";
                        $scope.data.viDo = res_tmp.viDo_do + " ° " + res_tmp.viDo_phut + " ' " + res_tmp.viDo_giay + '"';
                        $scope.data.kinhDo = res_tmp.kinhDo_do + " ° " + res_tmp.kinhDo_phut + " ' " + res_tmp.kinhDo_giay + '"';

                } else {
                    $scope.data.fViTriToaDo = "dd";
                }
            }, 500);
            $scope.$apply();
        })
    }

    $scope.error = function (e) {
        console.log(e);
    }

    var arrAuto = AuthService.arrAuto;
    $http.get(AuthService.hostName + '/content/dia-chat/auto').then(function (res) {
        $scope.auto = res.data;
        arrAuto.forEach(function (val) {
            AuthService.autoCom(val, $scope);
        })
    }, function (err) {
        console.log(err);
    });

    //name of route, config in app.config.js file
    var urlRe = 'quan-ly-dia-chat';
    $scope.addPost = function (FormContent) {
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/dia-chat', urlRe).then(function success(data) {
            console.log(data);
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
        });;
    }

    $scope.saveCookies = function () {
        localStorage.setItem("dataGeo", JSON.stringify($scope.data))
    }
    $scope.getCookies = function () {
        $scope.data = JSON.parse(localStorage.getItem("dataGeo"))
    }
});

app.controller('LandFormCtrl', function ($scope, $http, AuthService, $interval, $timeout) {

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
    };

    $scope.isSet = function (tab) {
        return $scope.tab === tab
    };

    // default unit
    initDefaultUnits($scope);

    // render flexdatalist
    AuthService.renderFlexdatalist()

    // DatePicker
    AuthService.initDatePicker(null, null);

    $scope.read = function (respone) {
        var urlFields = "/app/database/templateexcel/templateLand.json"
        var urlDates = "/app/database/templateexcel/landdate.json"
        var row = prompt("Nhập số thứ tự của mẫu: ")
        // console.log(row);
        var result = sheetToJson(respone, urlFields, urlDates, parseInt(row) + 12)
        result.then(function success(res_tmp) {
            $scope.data = res_tmp;
            // console.log(res_tmp);
            $timeout(function () {
                if ($scope.data.fViTriToaDo == "DMS") {
                    $scope.data.fViTriToaDo = "dms";
                    $scope.data.viDo = res_tmp.viDo_do + " ° " + res_tmp.viDo_phut + " ' " + res_tmp.viDo_giay + '"';
                    $scope.data.kinhDo = res_tmp.kinhDo_do + " ° " + res_tmp.kinhDo_phut + " ' " + res_tmp.kinhDo_giay + '"';
                } else {
                    $scope.data.fViTriToaDo = "dd";
                }
            }, 500);
            $scope.$apply();
        })
    }

    $scope.error = function (e) {
        console.log(e);
    }

    var arrAuto = AuthService.arrAuto;
    $http.get(AuthService.hostName + '/content/tho-nhuong/auto').then(function (res) {
        $scope.auto = res.data;
        arrAuto.forEach(function (val) {
            AuthService.autoCom(val, $scope);
        })
    }, function (err) {
        console.log(err);
    });

    //name of route, config in app.config.js file
    var urlRe = 'quan-ly-tho-nhuong';
    $scope.addPost = function (FormContent) {
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/tho-nhuong', urlRe).then(function success(data) {
            console.log(data);
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
        });;
    }

    saveData = $interval(function () {
        localStorage.setItem("dataLand", JSON.stringify($scope.data))
    }, 900000)

    $scope.saveCookies = function () {
        localStorage.setItem("dataLand", JSON.stringify($scope.data))
    }
    $scope.getCookies = function () {
        $scope.data = JSON.parse(localStorage.getItem("dataLand"))
    }
});

app.controller('PaleontologicalFormCtrl', function ($scope, $http, AuthService, $interval, $timeout) {

    $http.get('/app/database/tipspal.json').then(function (res) {
        $scope.tooltips = res.data;
    }, function (err) {
        console.log(err);
    });

    $scope.read = function (respone) {
        var urlFields = "/app/database/templateexcel/templatePal.json"
        var urlDates = "/app/database/templateexcel/paldate.json"
        var row = prompt("Nhập số thứ tự của mẫu: ")
        var result = sheetToJson(respone, urlFields, urlDates, parseInt(row) + 12)
        result.then(function success(res_tmp) {
            $scope.data = res_tmp;
            // console.log(res_tmp);
            // console.log($scope.data.fViTriToaDo);
            $timeout(function () {
                if ($scope.data.fViTriToaDo == "DMS") {
                    $scope.data.fViTriToaDo = "dms";
                    $scope.data.viDo = res_tmp.viDo_do + " ° " + res_tmp.viDo_phut + " ' " + res_tmp.viDo_giay + '"';
                    $scope.data.kinhDo = res_tmp.kinhDo_do + " ° " + res_tmp.kinhDo_phut + " ' " + res_tmp.kinhDo_giay + '"';
                } else {
                    // console.log("Running in dd");
                    $scope.data.fViTriToaDo = "dd";
                }
            }, 500);
            $scope.$apply();
        })
    }

    $scope.error = function (e) {
        console.log(e);
    }

    var keyid = navigator.userAgent + (new Date()).getTime().toString();
    $scope.randomStr = CryptoJS.MD5(keyid).toString();

    $scope.tab = 1;

    $scope.setTab = function (newTab) {
        $scope.tab = newTab;
    };

    $scope.isSet = function (tab) {
        return $scope.tab === tab
    };

    // default unit
    initDefaultUnits($scope);

    // render flexdatalist
    AuthService.renderFlexdatalist()

    // DatePicker
    AuthService.initDatePicker(null, null);

    var arrAuto = AuthService.arrAuto;
    $http.get(AuthService.hostName + '/content/co-sinh/auto').then(function (res) {
        $scope.auto = res.data;
        arrAuto.forEach(function (val) {
            AuthService.autoCom(val, $scope);
        })
    }, function (err) {
        console.log(err);
    });

    //name of route, config in app.config.js file
    var urlRe = 'quan-ly-co-sinh';
    $scope.addPost = function (FormContent) {
        AuthService.startSpinner();
        var fd = new FormData(document.getElementById('form-content'));
        AuthService.addSample(fd, AuthService.hostName + '/content/co-sinh', urlRe).then(function success(data) {
            console.log(data);
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
        });;
    }

    $scope.dms = function () {
        $scope.data.viDo = "";
        $scope.data.kinhDo = "";
    }
    $scope.dd = function () {
        $scope.data.viDo = ""
        $scope.data.kinhDo = ""
    }
    saveData = $interval(function () {
        localStorage.setItem("dataPal", JSON.stringify($scope.data))
    }, 900000)

    $scope.saveCookies = function () {
        localStorage.setItem("dataPal", JSON.stringify($scope.data))
    }
    $scope.getCookies = function () {
        $scope.data = JSON.parse(localStorage.getItem("dataPal"))
    }
});

app.controller('PlaceController', function ($scope, $http, $filter, AuthService, $timeout, $interval) {
    var places = {};
    $http.get('/app/database/cities.json').then(function (res) {
        $scope.cities = res.data;
        places.cities = res.data;
        $http.get('/app/database/districts.json').then(function (res) {
            // $scope.districts = res.data;
            places.districts = res.data; // pre load
            $http.get('/app/database/wards.json').then(function (res) {
                // $scope.wards = res.data;
                places.wards = res.data // pre load
                // console.log('cached');
            }, function (res) {
                alert("Lỗi không xác định!")
            });
        }, function (res) {
            alert("Lỗi không xác định!")
        });
    }, function (res) {
        alert("Lỗi không xác định!")
    });

    function bodauTiengViet(str) {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        return str;
    }
    $scope.countryChange = function () {
        var x = $scope.data.quocGia;
        if (bodauTiengViet(x) == "viet nam") {
            $scope.star = true;
        } else {
            $scope.star = false;
        }
    }

    $scope.cityChange = function () {
        if ('districts' in places) {
            var x = document.getElementById($scope.data.tinh);
            if (x == null) {
                $scope.data.huyen = ""
                $scope.data.xa = ""
            } else {
                // Get id to render data for district
                $scope.id_tinh = x.value
                $scope.districts = places.districts;
                $timeout(function () {
                    $('#render_districts').flexdatalist({
                        minLength: 0
                    });
                }, 200)
            }
        } else {
            $http.get('/app/database/districts.json').then(function (res) {
                $scope.districts = res.data;
                places.districts = res.data;
            }, function (res) {
                console.log(res);
            });
        }
    }
    $scope.star = true;
    $scope.star_tinh = true;

    $scope.starDatLien = function () {
        $scope.star = true;
    }
    $scope.starDao = function () {
        $scope.star_tinh = true;
        $scope.star = false;
    }

    $scope.starBien = function () {
        $scope.star = false;
        $scope.star_tinh = false;
    }

    $scope.districtChange = function () {
        if ('wards' in places) {
            var x = document.getElementById($scope.data.huyen);
            if (x == null) {
                $scope.data.xa = ""
            } else {
                $scope.id_huyen = x.value
                $scope.wards = places.wards;
                $timeout(function () {
                    $('#render_wards').flexdatalist({
                        minLength: 0
                    });
                }, 200)
            }
        } else {
            $http.get('/app/database/wards.json').then(function (res) {
                $scope.wards = res.data;
                places.wards = res.data
            }, function (res) {
                console.log(res);
            });
        }

    };
});

app.controller('CookiesManageController', function ($scope, $cookies) {

    $scope.saveCookies = function () {
        localStorage.setItem('data', JSON.stringify($scope.data));
        alert("Dữ liệu đã được lưu");
    }

    $scope.getCookies = function () {
        $scope.data = JSON.parse(localStorage.getItem('data'));
    }
})

app.controller('HttpIntegrationController', function ($scope, $http, $sce, bsLoadingOverlayService) {
    $scope.result = $sce.trustAsHtml('Fetch result here');
    $scope.fetchRandomText = function () {
        $http.get('http://hipsterjesus.com/api/')
        .success(function (data) {
            $scope.result = $sce.trustAsHtml(data.text);
        })
        .error(function () {
            $scope.result = $sce.trustAsHtml('Can not get the article');
        });
    };
});
