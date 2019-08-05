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
		loaiMauVat: [String],
		coQuanToChucGiamDinh: [String],
		coQuanXuLy: [String],
		viTriLayMauDNA: [String],
		mauDNA: [String],
		coQuanNhapVatMau: [String],
		giaTriSuDung: [String],
		// hinhThucNhapMau: [String],
		noiLuuTruMau: [String]
	};
	var mycologyAutoCompletion = mongoose.Schema(schemaPrototype);

	var mycologyAutoCompletion = mongoose.model("MycologyAutoCompletion", mycologyAutoCompletion);
	return mycologyAutoCompletion;
}