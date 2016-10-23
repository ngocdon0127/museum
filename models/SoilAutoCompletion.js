module.exports = function (mongoose) {
	var schemaPrototype = {
		coQuanThuMau: [String],
		quocGia: [String],
		tinh: [String],
		huyen: [String],
		xa: [String],
		thon: [String],
		coQuanToChucGiamDinh: [String],
		coQuanXuLy: [String],
		coQuanNhapVatMau: [String]
	};
	var soilAutoCompletion = mongoose.Schema(schemaPrototype);

	var soilAutoCompletion = mongoose.model("SoilAutoCompletion", soilAutoCompletion);
	return soilAutoCompletion;
}