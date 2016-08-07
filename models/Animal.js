module.exports = function (mongoose) {
	var schemaPrototype = {
		// soHieu: {
		// 	maBaoTang: String,
		// 	soHieuThucDia: String,
		// 	soHieuBaoTangCS
		// 	soHieuBTTNVN
		// 	maKyHieuMauVatQuocTe
		// 	kyHieuMauVatKhac
		// },
		// tenMau: {
		// 	tenVietNam
		// 	tenTiengAnh
		// 	tenDiaPhuong
		// 	tenKhoaHoc
		// 	tenDongNghia
		// 	gioi
		// 	nganh
		// 	lop
		// 	phanLop
		// 	bo
		// 	phanBo
		// 	lienHo
		// 	ho
		// 	phanHo
		// 	toc
		// 	giong
		// 	loai
		// 	duoiLoai
		// 	nguoiDinhTen
		// },
		// soLuongChatLuong: {
		// 	soLuongMauVat: Number,
		// 	soLuongTieuBan: Number,
		// 	loaiMau
		// 	kichThuocMau: Number,
		// 	tinhTrangMau
		// },
		// duLieuThuMau: {
		// 	thoigianThuMau: Date,
		// 	nguoiThuMau
		// 	phuongPhapThuMau
		// 	diaDiemThuMau: {
		// 		quocGia
		// 		tinh
		// 		huyen
		// 		xa
		// 		thon
		// 	},
		// 	viTriToaDo: {
		// 		viDo
		// 		kinhDo
		// 	}
		// 	doCao: Number,
		// 	doSau : Number,
		// 	vungBien
		// 	sinhHoc
		// 	thongTinDuAn
		// 	ghiChepThucDia
		// 	banDo
		// 	ghiChu
		// },
		duLieuPhanTichMau: {
			thoiGianPhanTich: Date,
			nguoiPhanTich: String,
			coQuanToChucPhanTich: String,
			taiLieuPhanTich: [String],
			moTaHinhThai: String,
			hinhVe: [String],
		},
		// anhMauVat: [String],
		// hinhAnhMauNgoaiThucDia: [String],
		// thongTinVePhimVideo: [String],
		xuLyCheTac: {
			hinhAnhDinhKem: [String],
			dinhKemXuLy: [String],
			thuocTinhXuLy: String,
			phuongThucXuLy: String,
			nguoiXuLy: String,
			coQuanXuLy: String,
			anhMauSauCheTac: String
		}
		// thongTinDNA: {
		// 	viTriLayMauDNA
		// 	mauDNA
		// 	dinhKemChayTrinhTuDNA
		// 	trichDanTrinhTuDNA
		// 	trinhTuDNA
		// 	dinhKemTrinhTuDNA
		// 	congBoQuocTe
		// }
		// phanBoDiaLy: {
		// 	phanBoVietNam
		// 	phanBoTrenTheGioi
		// }
		// giaTriSuDung
		// ngayNhapMau: Date
		// nguoiGiao
		// nguoiNhan
		// coQuanNhapVatMau
		// hinhThucNhapMau
		// traoDoiMau
		// vayMuon
		// hienTang
		// khuLuuTruMau
		// noiLuuGiu
		// giayPhepNhapMau
		// hoSoNhapMauVatDiKem: [String],
		// nguoiLapPhieuMauVat
		// nguoiLapVaoPhanMem
		// thongTinKhac
	};
	var animalSchema = mongoose.Schema(schemaPrototype);

	var Animal = mongoose.model("Animal", animalSchema);
	return Animal;
}