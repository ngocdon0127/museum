module.exports = function (mongoose) {
	var schemaPrototype = {
		tenTheoQuocTe: [String],
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
		coQuanXuLy: [String],
		coQuanNhapVatMau: [String],
		giaTriSuDung: [String],
		// Update after 12 / 12 / 2016
		// hinhThucNhapMau: [String],
		noiLuuTruMau: [String]
	};
	var soilAutoCompletion = mongoose.Schema(schemaPrototype);

	var soilAutoCompletion = mongoose.model("SoilAutoCompletion", soilAutoCompletion);
	return soilAutoCompletion;
}