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
		coQuanXuLy: [String],
		coQuanToChucGiamDinh: [String],
		coQuanNhapVatMau: [String],
		giaTriSuDung: [String],
		// hinhThucNhapMau: [String],
		noiLuuTruMau: [String]
	};
	var geologicalAutoCompletion = mongoose.Schema(schemaPrototype);

	var geologicalAutoCompletion = mongoose.model("GeologicalAutoCompletion", geologicalAutoCompletion);
	return geologicalAutoCompletion;
}