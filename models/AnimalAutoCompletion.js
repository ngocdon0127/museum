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
		toc: [String],
		giong: [String],
		loai: [String],
		duoiLoai: [String],
	};
	var animalAutoCompletion = mongoose.Schema(schemaPrototype);

	var animalAutoCompletion = mongoose.model("AnimalAutoCompletion", animalAutoCompletion);
	return animalAutoCompletion;
}