module.exports = function (mongoose) {
	var schemaPrototype = {
		created_at: Date,
		updated_at: Date,
		deleted_at: Date,
		soHieu: {
			soHieuThucDia: String,
			soHieuBaoTangCS: String,
			soHieuBTTNVN: String,
			maKyHieuMauVatQuocTe: String,
			kyHieuMauVatKhac: String,
			thongTinKhac1: String
		},
		tenMau: {
			tenVietNam: String,
			tenTiengAnh: String,
			tenTheoBaoTang: String,
			tenKhoaHoc: String,
			tenDongNghia: String,
			gioi: String,
			nganh: String,
			lop: String,
			phanLop: String,
			bo: String,
			phanBo: String,
			lienHo: String,
			ho: String,
			phanHo: String,
			toc: String,
			giong: String,
			loai: String,
			duoiLoai: String,
			nguoiDinhTen: String,
			thongTinKhac2: String
		},
		soLuongChatLuong: {
			soLuongMauVat: Number,
			soLuongTieuBan: Number,
			loaiMau: String,
			kichThuocMau: String,
			tinhTrangMau: String,
			thongTinKhac3: String
		},
		duLieuThuMau: {
			thoiGianThuMau: Date,
			nguoiThuMau: String,
			coQuanThuMau: String,
			phuongPhapThuMau: String,
			diaDiemThuMau: {
				quocGia: String,
				tinh: String,
				huyen: String,
				xa: String,
				thon: String
			},
			viTriToaDo: {
				viDo: String,
				kinhDo: String
			},
			doCao: Number,
			doSau : Number,
			vungBien: String,
			sinhHoc: String,
			thongTinDuAn: String,
			ghiChepThucDia: String,
			banDo: [String],
			thongTinKhac4: String
		},
		duLieuPhanTichMau: {
			thoiGianPhanTich: Date,
			nguoiPhanTich: String,
			coQuanToChucPhanTich: String,
			taiLieuPhanTich: [String],
			moTaHinhThaiStr: String,
			moTaHinhThaiFile: [String],
			hinhVe: [String],
			thongTinKhac5: String
		},
		media: {
			anhMauVat: [String],
			anhNgoaiThucDia: [String],
			videoStr: String,
			videoFile: [String],
			xuLyCheTac: {
				thuocTinhXuLy: String,
				phuongThucXuLy: String,
				coQuanXuLy: String,
				nguoiXuLy: String,
				dinhKemXuLy: [String],
				hinhAnhDinhKem: [String],
				anhMauSauCheTac: [String]
			},
			thongTinDNA: {
				boPhanLayMauDNA: String,
				trangThaiGiuMauDNA: String,
				vungGenPhanTich: String,
				dinhKemTrinhTuDNA: [String],
				congBoQuocTe: String
			},
			thongTinKhac6: String
		},
		phanBoVaSuDung: {
			phanBoDiaLy: {
				phanBoVietNamStr: String,
				phanBoVietNamFile: [String],
				phanBoTrenTheGioiStr: String,
				phanBoTrenTheGioiFile: [String]
			},
			giaTriSuDung: String,
			thongTinKhac7: String
		},
		luuTruBaoQuan: {
			ngayNhapMau: Date,
			nguoiGiao: String,
			nguoiNhan: String,
			coQuanNhapVatMau: String,
			hinhThucNhapMau: String,
			traoDoiMau: String,
			vayMuon: String,
			khuLuuTruMau: String,
			noiLuuTruMau: String,
			giayPhepNhapMau: [String],
			hoSoNhapMauVatDiKem: [String],
			nguoiNhapPhieuMauVat: String,
			nguoiNhapVaoPhanMem: String,
			thongTinKhac8: String
		},
		thongTinKhac: {
			thongTinKhac9: String
		},
		maDeTai: {
			maDeTai: String
		}
	};
	var animalSchema = mongoose.Schema(schemaPrototype);
	var Animal = mongoose.model("Animal", animalSchema);
	return Animal;
}