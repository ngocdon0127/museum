module.exports = function (mongoose) {
	var schemaPrototype = {
		tenVietNam: [String],
		tenDiaPhuong: [String],
		tenTiengAnh: [String],
		tenTheoBaoTang: [String],
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
		toc: [String],
		giong: [String],
		phanGiong: [String],
		loai: [String],
		duoiLoai: [String],
		coQuanThuMau: [String],
		quocGia: [String],
		tinh: [String],
		huyen: [String],
		xa: [String],
		thon: [String],
		coQuanThuMau: [String],
		coQuanToChucPhanTich: [String],
		coQuanXuLy: [String],
		boPhanLayMauDNA: [String],
		trangThaiGiuMauDNA: [String],
		coQuanNhapVatMau: [String],
		giaTriSuDung: [String],
		// hinhThucNhapMau: [String],
		noiLuuTruMau: [String]
		// will update after 12 / 12 / 2016
		// boPhanLayMauDNA: [String],
		// trangThaiGiuMauDNA: [String]
		//
	};
	var animalAutoCompletion = mongoose.Schema(schemaPrototype);

	var animalAutoCompletion = mongoose.model("AnimalAutoCompletion", animalAutoCompletion);
	return animalAutoCompletion;
}