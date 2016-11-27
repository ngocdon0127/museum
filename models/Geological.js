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
			tenDiaPhuong: String,
			tenTiengAnh: String,
			tenTheoBaoTang: String,
			tenTheoQuocTe: String,
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
			phanTichQuangHocStr: String,
			phanTichQuangHocFile: [String],
			ketQuaThanhPhanVatChat: [String],
			ketQuaPhanTichDongVi: [String],
			phanTichKhac: [String],
			duLieuDiaChat: {
				dacDiemDiaChat: String,
				loaiHinhNguonGoc: String,
			},
			thongTinKhac5: String
		},
		media: {
			anhMauVat: [String],
			anhNgoaiThucDia: [String],
			videoStr: String,
			videoFile: [String],
			xuLyCheTac: {
				hinhAnhDinhKem: [String],
				dinhKemXuLy: [String],
				phuongThucXuLy: String,
				nguoiXuLy: String,
				coQuanXuLy: String,
				anhMauSauCheTac: [String]
			},
			thongTinKhac6: String
		},
		dacDiemMauVat: {
			loaiMau : String,
			hinhDangMauTonTai : String,
			mauSac : String,
			phanLoaiSuDung : String,
			thanhPhanKhoangVat : String,
			tinhChatVatLy : String,
			congThucHoaHoc : [String],
			thanhPhanHoaHoc : String,
		},
		phanBoVaSuDung: {
			phanBoVietNamStr: String,
			phanBoVietNamFile: [String],
			phanBoTrenTheGioiStr: String,
			phanBoTrenTheGioiFile: [String],
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
			noiLuuTru: String,
			khuLuuTruMau: {
				phong: String,
				tuGia: String,
				ngan: String,
				hop: String,
			},
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
	var geologicalSchema = mongoose.Schema(schemaPrototype);

	var Geological = mongoose.model("Geological", geologicalSchema);
	return Geological;
}