module.exports = function (mongoose) {
	var schemaPrototype = {
		soHieu: {
			maBaoTang: String,
			soHieuBaoTangCS: String,
			maKyHieuMauVatQuocTe: String,
			soHieuThucDia: String,
			soHieuBTTNVN: String,
			kyHieuMauVatKhac: String
		},
		tenMau: {
			tenVietNam: String,
			tenTiengAnh: String,
			tenKhoaHoc: String,
			tenDiaPhuong: String,
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
			kichThuocMau: Number,
			loaiMau: String,
			tinhTrangMau: String
		},
		duLieuThuMau: {
			thoigianThuMau: Date,
			nguoiThuMau: String,
			phuongPhapThuMau: String,
			diaDiemThuMau: {
				quocGia: String,
				tinh: String,
				huyen: String,
				xa: String,
				thon: String
			},
			viTriToaDo: {
				viDo: Number,
				kinhDo: Number
			},
			doCao: Number,
			doSau : Number,
			vungBien: String,
			sinhHoc: String,
			thongTinDuAn: String,
			ghiChepThucDia: String,
			banDo: String,
			ghiChu: String
		},
		duLieuPhanTichMau: {
			thoiGianPhanTich: Date,
			nguoiPhanTich: String,
			coQuanToChucPhanTich: String,
			taiLieuPhanTich: [String],
			moTaHinhThai: String,
			hinhVe: [String],
		},
		
		phanBoVaSuDung: {
			phanBoDiaLy: {
				phanBoVietNam: String,
				phanBoTrenTheGioi: String
			},
			giaTriSuDung: String
		},
		
		media: {
			xuLyCheTac: {
				thuocTinhXuLy: String,
				phuongThucXuLy: String,
				coQuanXuLy: String,
				nguoiXuLy: String,
				dinhKemXuLy: [String],
				hinhAnhDinhKem: [String],
				anhMauSauCheTac: String
			},
			thongTinDNA: {
				viTriLayMauDNA: String,
				mauDNA: String,
				dinhKemChayTrinhTuDNA: [String],
				trichDanTrinhTuDNA: String,
				trinhTuDNA: String,
				dinhKemTrinhTuDNA: [String],
				congBoQuocTe: String
			}
		},

		luuTruBaoQuan: {
			coQuanNhapVatMau: String,
			ngayNhapMau: Date,
			nguoiGiao: String,
			nguoiNhan: String,
			tinhTrangMau: String,
			traoDoiMau: String,
			vayMuon: String,
			hienTang: String,
			nguoiLapPhieuMauVat: String,
			nguoiLapVaoPhanMem: String,
			hinhThucNhapMau: String,
			giayPhepNhapMau: String,
			khuLuuTruMau: String
		},
		
		thongTinKhac: {
			thongTinKhac: String
		}
	};
	var animalSchema = mongoose.Schema(schemaPrototype);

	var Animal = mongoose.model("Animal", animalSchema);
	return Animal;
}