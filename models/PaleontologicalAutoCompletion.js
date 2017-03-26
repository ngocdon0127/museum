module.exports = function (mongoose) {
	var schemaPrototype = {
		tenDongNghia: [String],
		gioi: [String],
		nganh: [String],
		lop: [String],
		phanLop: [String],
		bo: [String],
		ho: [String],
		lienHo: [String],
		phanHo: [String],
		chiGiong: [String],
		phanChiPhanGiong: [String],
		loai: [String],
		duoiLoai: [String],
		tenVietNam: [String],
		tenDiaPhuong: [String],
		tenTiengAnh: [String],
		tenTheoBaoTang: [String],
		coQuanThuMau: [String],
		quocGia: [String],
		tinh: [String],
		huyen: [String],
		xa: [String],
		thon: [String],
		coQuanToChucGiamDinh: [String],
		vungGenPhanTich: [String],
		coQuanNhapVatMau: [String],
		coQuanXuLy: [String],
		giaTriSuDung: [String],
		// hinhThucNhapMau: [String],
		noiLuuTruMau: [String]
	};
	var paleontologicalAutoCompletion = mongoose.Schema(schemaPrototype);

	var paleontologicalAutoCompletion = mongoose.model("PaleontologicalAutoCompletion", paleontologicalAutoCompletion);
	return paleontologicalAutoCompletion;
}