// // Dong bo de doc du lieu tu file excel
// async function sheetToJson(workbook, urlFields) {
//     // create a Form data to put data
//     var result = {};
//     var roa;
//     var test;
//     var data;
//     await workbook.SheetNames.forEach(function (sheetName) {
//         console.log(sheetName);
//         if (sheetName == "Mau Hang") {
//         roa = XLS.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
//         test = workbook.Sheets[sheetName];
//         // console.log(test)
//         }
//     });

//     await $.get(urlFields).then(function success(res) {
//         data = res
//         // console.log(data);
//     }, function error(err) {
//         console.log(err);
//     });

//     await data.forEach(function (element) {
//         try {
//             var typeData = test
//             var _tmp = test[element[1]];
//             var prop = test[element[0]]["h"];
//             if (typeof (_tmp) !== "undefined") {
//                 if (_tmp["t"] == "n") {
//                     result[prop] = _tmp["v"];
//                 } else {
//                     result[prop] = _tmp["h"].trim();
//                 }
//             } else {
//                 result[prop] = "";
//             }
//         } catch (e) {
//             // console.log(e);
//         }
//     });
//     console.log(result);
//     return result;
// }

app.controller('OfflineCtrl', function ($scope, $http, AuthService) {
    // $scope.openFile = function (event) {
    //     var input = event.target;
    //     var reader = new FileReader();
    //     reader.onload = function () {
    //         var text = reader.result;
    //         var node = document.getElementById('output');
    //         node.innerText = text;
    //         console.log(reader.result.substring(0, 200));
    //     };
    //     reader.readAsText(input.files[0]);
    // };

    $scope.name = "not read";

    // $scope.read = function (data) {
    //     $scope.name = "read";
    //     urlRe = "quan-ly-dong-vat"
    //     var urlFields = "/app/database/templateAni.json"
    //     // console.log(data);
    //     var result = sheetToJson(data, urlFields)
    //     result.then(function success(res) {
    //         console.log("success");
    //     })
    // }

    // $scope.error = function (e) {
    //     console.log(e);
    // }

    // $scope.download = function () {
    //     var link = "/content/co-sinh/58efc6ae1115041b38decf48?display=docx";
    //     var test = document.getElementsByName('dataFlex');
    //     var data = test[0].value
    //     data = data.replace(/_-_/g, "=1&")
    //     if (data != "") {
    //         data = "custom=1&" + data + "=1";
    //     }
    //     // var data = {
    //     //     "custom" : 1,
    //     //     "soHieuBTTNVN" : 1,
    //     //     "soHieuThucDia" : 1,
    //     //     "kyHieuMauVatKhac" : 1,
    //     //     "tenTiengAnh" : 1
    //     // }
    //     console.log(data);
    //     var xhr = new XMLHttpRequest();
    //     xhr.onreadystatechange = function () {
    //         if ((xhr.readyState == 4) && (xhr.status == 200)) {
    //             var disposition = xhr.getResponseHeader('Content-Disposition');
    //             var file_names = disposition.split([';'])
    //             var file_name = decodeURIComponent(file_names[2]);
    //             var type = xhr.getResponseHeader('Content-Type');
    //             var blob = new Blob([xhr.response], {
    //                 type: type
    //             });
    //             saveAs(blob, file_name);
    //         }
    //     }
    //     xhr.responseType = 'arraybuffer';
    //     xhr.open('POST', link, true);
    //     xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //     xhr.send(data);
    // }

    // AuthService.renderFlexdatalist("value")
});
