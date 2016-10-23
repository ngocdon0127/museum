module.exports = function (mongoose) {
	var schemaPrototype = {
		tenKhoaHoc: [String],
		coQuanThuMau: [String],
		quocGia: [String],
		tinh: [String],
		huyen: [String],
		xa: [String],
		thon: [String],
		coQuanToChucPhanTich: [String],
		coQuanNhapVatMau: [String],
	};
	var geologicalAutoCompletion = mongoose.Schema(schemaPrototype);

	var geologicalAutoCompletion = mongoose.model("GeologicalAutoCompletion", geologicalAutoCompletion);
	return geologicalAutoCompletion;
}