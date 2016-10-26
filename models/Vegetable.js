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
			kyHieuMauVatKhac: String
		},
		tenMau: {
			tenVietNam: String,
			tenDiaPhuong: String,
			tenTiengAnh: String,
			tenTheoBaoTang: String,
			tenTheoQuocTe: String,
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
			tong: String,
			chi: String,
			loai: String,
			duoiLoai: String,
			nguoiDinhTen: String
		},
		soLuongChatLuong: {
			soLuongMauVat: Number,
			soLuongTieuBan: Number,
			loaiMau: String,
			kichThuocMau: String,
			tinhTrangMau: String
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
			banDo: [String]
		},
		duLieuPhanTichMau: {
			thoiGianPhanTich: Date,
			nguoiPhanTich: String,
			coQuanToChucPhanTich: String,
			taiLieuPhanTich: [String],
			moTaHinhThaiStr: String,
			moTaHinhThaiFile: [String],
			hinhVe: [String],
		},
		media: {
			anhMauVat: [String],
			hinhAnhNgoaiThucDia: [String],
			videoStr: String,
			videoFile: [String],
			xuLyCheTac: {
				hinhAnhDinhKem: [String],
				phuongThucXuLy: String,
				nguoiXuLy: String,
				coQuanXuLy: String,
				anhMauSauCheTac: [String]
			},
			thongTinDNA: {
				boPhanLayMauDNA: String,
				trangThaiGiuMauDNA: String,
				dinhKemChayTrinhTuDNA: String,
				trichDanTrinhTuDNA: String,
				trinhTuDNA: String,
				dinhKemTrinhTuDNA: [String],
				congBoQuocTe: String,
				thongTinMauHatPhan: String
			}
		},
		phanBoVaSuDung: {
			phanBoDiaLy: {
				phanBoVietNamStr: String,
				phanBoVietNamFile: [String],
				phanBoTrenTheGioiStr: String,
				phanBoTrenTheGioiFile: [String]
			},
			giaTriSuDung: String
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
		},
		thongTinKhac: {
			thongTinKhac: String
		}
	};
	var vegetableSchema = mongoose.Schema(schemaPrototype);
	var Vegetable = mongoose.model("Vegetable", vegetableSchema);
	return Vegetable;
}