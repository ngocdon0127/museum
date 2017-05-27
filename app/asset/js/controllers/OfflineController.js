app.controller('OfflineCtrl', function ($scope, $http) {
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

    $scope.download = function () {
        var link = "/content/dong-vat/59153670d01e41313c837dc9?display=docx";
        var data = {
          'custom': 1,
          'soHieuBTTNVN': 1,
          'soHieuThucDia': 1,
          'kyHieuMauVatKhac' : 1, 
          'tenTiengAnh': 1
        }
    //   var xhr = new XMLHttpRequest();
    //       xhr.onreadystatechange = function () {
    //         if ((xhr.readyState == 4) && (xhr.status == 200)){
    //           var disposition = xhr.getResponseHeader('Content-Disposition');
    //           var file_names = disposition.split([';'])
    //           var file_name = decodeURIComponent(file_names[2]);
    //           var type = xhr.getResponseHeader('Content-Type');
    //           console.log(type);
    //           var blob = new Blob([xhr.response], {type: type});
    //           saveAs(blob, file_name);
    //         }
    //       }
    //       xhr.responseType = 'arraybuffer';
    //       xhr.open('GET',link, true);
    //       xhr.send();
    
        // $http.post(link, data).then(function(res){
        //     console.log(res.data);
        //     var type = res.config.headers['Content-Type']
        //     file_name = "hola.docx"
        //     var blob = new Blob([res.data], {type: type});
        //     saveAs(blob, file_name);
        // }, function (err) {
        //     console.log(err);
        // })

        $http({
            method: "POST",
            url: link
        }).then(function (res) {
            console.log(res);
        }, function (err) {
            console.log("Loi roi");
            console.log(err);
        })

    }
});