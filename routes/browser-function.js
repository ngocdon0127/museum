// var nodes = [];
// var arr = [];
// var tree = '';

function generate (schema) {
	if (typeof(schema) != 'object'){
		tree = nodes.join('.');
		var pos = tree.lastIndexOf('.');
		(pos >= 0) ? (tree = tree.substring(0, pos)) : (tree = "");
		arr.push({
			name: nodes[nodes.length - 1], 
			schemaProp: tree,
			label: '',
			required: false,
			type: "String",
			regex: "^.{0,100}$",
			autoCompletion: false
		});
	}
	else {
		for (var i in schema){
			nodes.push(i);
			generate(schema[i]);
			nodes.splice(nodes.length - 1, 1);
		}
	}
}

// JSON.stringify(arr, null, 4);

function autoFill () {
	var animal = {
		soHieuThucDia: "SHTD - Dinosauria",
		soHieuBaoTangCS: "BTTT - Khủng Long",
		soHieuBTTNVN: "BTTT-KL",
		maKyHieuMauVatQuocTe: "VN-Dinosauria",
		tenVietNam: "Khủng long ba sừng",
		tenDiaPhuong: "Mặt ba sừng",
		tenTiengAnh: "Triceratops",
		tenTheoBaoTang: "BTTT-BaSung",
		tenDongNghia: "Mặt ba sừng",
		gioi: "Mặt ba sừng",
		nganh: "Chordata",
		lop: "Sauropsida",
		bo: "Ornithischia",
		phanBo: "Ceratopsia",
		ho: "Ceratopsidae",
		phanHo: "Ceratopsinae",
		giong: "Triceratops",
		loai: "T. horridus",
		nguoiDinhTen: "Đinh Viết Sang",
		soLuongMauVat: 2,
		soLuongTieuBan: 4,
		loaiMau: "Mẫu trưng bày",
		kichThuocMau: "9",
		tinhTrangMau: "Hóa thạch",
		thongTinKhac3: "Hóa thạch vỡ",
		thoiGianThuMau: "2016-11-02T00:00:00.000Z",
		nguoiThuMau: "Đinh Viết Sang",
		coQuanThuMau: "HUST",
		phuongPhapThuMau: "Khai quật",
		quocGia: "Việt Nam",
		tinh: "01",
		huyen: "007",
		xa: "00250",
		thon: "123132",
		viDo: "21.003",
		kinhDo: "105.83",
		doCao: 20,
		thongTinDuAn: "Đợt thu thập cuối năm 2016",
		ghiChepThucDia: "Xương vỡ",
		thongTinKhac4: "Thông tin khác",
		thoiGianPhanTich: "2016-11-03T00:00:00.000Z",
		nguoiPhanTich: "Đinh Viết Sang",
		coQuanToChucGiamDinh: "ICT HUST",
		nguoiXuLy: "Đinh Viết Sang",
		coQuanXuLy: "HUST",
		boPhanLayMauDNA: "Xương",
		trangThaiGiuMauDNA: "Khô",
		vungGenPhanTich: "AUGX",
		phanBoVietNamStr: "Hà Nội",
		ngayNhapMau: "2016-11-04T00:00:00.000Z",
		nguoiGiao: "Đinh Viết Sang",
		nguoiNhan: "Đinh Viết Sang",
		hinhThucNhapMau: "thu-thap",
		traoDoiMau: "Có thể",
		vayMuon: "Không thể",
		nguoiNhapPhieuMauVat: "Đinh Viết Sang",
		thongTinKhac9: "1 mẫu đã cho mượn",
		maDeTai: "DT-001"
	}

	for(var prop in animal){
		try {
			document.getElementsByName(prop)[0].value = animal[prop];
		}
		catch (e){
			console.log(e);
		}
	}
}

// Muốn convert docx sang pdf, phải cài Libreoffice và desktop environment cho server:
// Libreoffice: https://rpmfind.net/linux/rpm2html/search.php?query=libcairo.so.2
// yum groupinstall -y 'Desktop'

/* Notes Autocomplete:{
	hinhThucNhapMau: "Thu thập", "Hiến Tặng"
}

*/