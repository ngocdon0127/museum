module.exports = function (mongoose) {
	var schemaPrototype = {
		tenDongNghia: [String],
		gioi: [String],
		nganh: [String],
		lop: [String],
		phanLop: [String],
		bo: [String],
		phanBo: [String],
		lienHo: [String],
		ho: [String],
		phanHo: [String],
		tong: [String],
		tong: [String],
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
		coQuanXuLy: [String],
		viTriLayMauDNA: [String],
		mauDNA: [String],
		coQuanNhapVatMau: [String],
		giaTriSuDung: [String],
		hinhThucNhapMau: [String]
	};
	var vegetableAutoCompletion = mongoose.Schema(schemaPrototype);

	var vegetableAutoCompletion = mongoose.model("VegetableAutoCompletion", vegetableAutoCompletion);
	return vegetableAutoCompletion;
}