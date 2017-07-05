// Dong bo de doc du lieu tu file excel
async function to_json(workbook) {
    // create a Form data to put data
    var result = {};
    // var result = new FormData();
    var roa;
    var test;
    var data;
    await workbook.SheetNames.forEach(function(sheetName) {
        roa = XLS.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        test = workbook.Sheets[sheetName];
    });

    await $.get("/app/database/fieldspal.json").then(function success(res) {
                data = res
            }, function error(err) {
                console.log(err);
            });

    await data.forEach(function(element) {
        result[test[element[1]]["h"]] = test[element[0]]["h"];
    });
    return result;
}

app.controller('OfflineCtrl', function ($scope, $http, AuthService) {
    $scope.openFile = function(event) {
      	var input = event.target;

      	var reader = new FileReader();
      	reader.onload = function(){
        	var text = reader.result;
        	var node = document.getElementById('output');
        	node.innerText = text;
        	console.log(reader.result.substring(0, 200));
      	};
      	reader.readAsText(input.files[0]);
    };

    $scope.read = function (data) {
        urlRe = "quan-ly-dong-vat"
        var result = to_json(data)
        result.then(function success(res) {
            console.log(res);
        })
        
        // AuthService.startSpinner();
        // AuthService.addSample(result, AuthService.hostName + '/content/dong-vat', urlRe);
    }

    $scope.error = function (e) {
        console.log(e);
    }

    $scope.download = function () {
        var link = "/content/co-sinh/58efc6ae1115041b38decf48?display=docx";
        var test = document.getElementsByName('dataFlex');
        var data = test[0].value
        data = data.replace(/_-_/g, "=1&")
        if (data != "") {
            data = "custom=1&" + data + "=1";
        }
        // var data = {
        //     "custom" : 1,
        //     "soHieuBTTNVN" : 1,
        //     "soHieuThucDia" : 1,
        //     "kyHieuMauVatKhac" : 1,
        //     "tenTiengAnh" : 1
        // }
        console.log(data);
        var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if ((xhr.readyState == 4) && (xhr.status == 200)){
                  var disposition = xhr.getResponseHeader('Content-Disposition');
                  var file_names = disposition.split([';'])
                  var file_name = decodeURIComponent(file_names[2]);
                  var type = xhr.getResponseHeader('Content-Type');
                  var blob = new Blob([xhr.response], {type: type});
                  saveAs(blob, file_name);
                }
            }
        xhr.responseType = 'arraybuffer';
        xhr.open('POST',link, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(data);
    }

    AuthService.renderFlexdatalist("value")
});