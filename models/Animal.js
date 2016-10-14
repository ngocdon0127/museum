module.exports = function (mongoose) {
	var schemaPrototype = {
		created_at: Date,
		updated_at: Date,
		deleted_at: Date,
		soHieu: {
			soHieuBaoTangCS: String,
			maKyHieuMauVatQuocTe: String,
			soHieuThucDia: String,
			soHieuBTTNVN: String,
			kyHieuMauVatKhac: String
		},
		tenMau: {
			tenVietNam: String,
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
			toc: String,
			giong: String,
			loai: String,
			duoiLoai: String,
			nguoiDinhTen: String
		},
		soLuongChatLuong: {
			soLuongMauVat: Number,
			soLuongTieuBan: Number,
			kichThuocMau: String,
			loaiMau: String,
			tinhTrangMau: String
		},
		duLieuThuMau: {
			thoiGianThuMau: Date,
			nguoiThuMau: String,
			phuongPhapThuMau: String,
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
			doCao: Number,
			doSau : Number,
			vungBien: String,
			sinhHoc: String,
			thongTinDuAn: String,
			ghiChepThucDia: String,
			banDo: String
		},
		duLieuPhanTichMau: {
			thoiGianPhanTich: Date,
			nguoiPhanTich: String,
			coQuanToChucPhanTich: String,
			taiLieuPhanTich: [String],
			moTaHinhThai: String,
			hinhVe: [String],
		},
		
		media: {
			anhMauVat: [String],
			anhNgoaiThucDia: [String],
			video: [String],
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
			}
		},

		phanBoVaSuDung: {
			phanBoDiaLy: {
				phanBoVietNam: String,
				phanBoTrenTheGioi: String
			},
			giaTriSuDung: String
		},

		luuTruBaoQuan: {
			coQuanNhapVatMau: String,
			ngayNhapMau: Date,
			nguoiGiao: String,
			nguoiNhan: String,
			traoDoiMau: String,
			vayMuon: String,
			nguoiNhapPhieuMauVat: String,
			nguoiNhapVaoPhanMem: String,
			hinhThucNhapMau: String,
			giayPhepNhapMau: [String],
			hoSoNhapMauVatDiKem: [String],
			khuLuuTruMau: String,
			noiLuuTruMau: String
		},
		
		thongTinKhac: {
			thongTinKhac: String
		}
	};
	var animalSchema = mongoose.Schema(schemaPrototype);

	var Animal = mongoose.model("Animal", animalSchema);
	return Animal;
}