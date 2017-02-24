module.exports = function (mongoose) {
	var schemaPrototype = {
		tenKhoaHoc: [String],
		tenDongNghia: [String],
		gioi: [String],
		nganh: [String],
		lop: [String],
		bo: [String],
		ho: [String],
		chi: [String],
		loai: [String],
		duoiLoai: [String],
		coQuanThuMau: [String],
		quocGia: [String],
		tinh: [String],
		huyen: [String],
		xa: [String],
		thon: [String],
		coQuanToChucPhanTich: [String],
		vungGenPhanTich: [String],
		coQuanNhapVatMau: [String],
		giaTriSuDung: [String],
		hinhThucNhapMau: [String]
	};
	var paleontologicalAutoCompletion = mongoose.Schema(schemaPrototype);

	var paleontologicalAutoCompletion = mongoose.model("PaleontologicalAutoCompletion", paleontologicalAutoCompletion);
	return paleontologicalAutoCompletion;
}