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
			bo: String,
			ho: String,
			giong: String,
			loai: String,
			duoiLoai: String,
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
			thongTinDuAn: String,
			thongTinDiaTang: String,
			ghiChepThucDia: String,
		},
		duLieuPhanTichMau: {
			thoiGianPhanTich: Date,
			nguoiPhanTich: String,
			coQuanToChucPhanTich: String,
			taiLieuPhanTich: [String],
			phanTichTuoiDiaChat: [String],
			dacDiemViCauTruc: [String],
			dacDiemLatMong: [String]
		},
		media: {
			anhMauVat: [String],
			anhNgoaiThucDia: [String],
			videoStr: String,
			videoFile: [String],
			xuLyCheTac: {
				hinhAnhDinhKem: [String],
				dinhKemXuLy: [String],
				thuocTinhXuLy: String,
				phuongThucXuLy: String,
				nguoiXuLy: String,
				coQuanXuLy: String,
				anhMauSauCheTac: [String]
			},
			thongTinDNA: {
				dinhKemChayTrinhTuDNA: String,
				trichDanTrinhTuDNA: String,
				trinhTuDNA: String,
				dinhKemTrinhTuDNA: [String],
				congBoQuocTe: String,
				hinhVe: [String]
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
			nguoiNhapVaoPhanMem: String
		},
		thongTinKhac: {
			thongTinKhac: String
		}
	};
	var paleontologicalSchema = mongoose.Schema(schemaPrototype);
	var Paleontological = mongoose.model("Paleontological", paleontologicalSchema);
	return Paleontological;
}