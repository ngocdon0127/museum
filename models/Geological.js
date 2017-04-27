module.exports = function (mongoose) {
	var schemaPrototype = {
		created_at: Date,
		updated_at: Date,
		deleted_at: Date,
		created_by: {
			userId: String,
			userFullName: String
		},
		updated_by: { // Only save the last update
			userId: String,
			userFullName: String
		},
		deleted_by: {
			userId: String,
			userFullName: String
		},
		soHieu: {
			soHieuBTTNVN: String,
			soHieuBaoTangCS: String,
			soHieuThucDia: String,
			kyHieuMauVatKhac: String,
			thongTinKhac1: String
		},
		tenMau: {
			tenTheoQuocTe: String,
			nguoiDinhTen: String,
			ngayDinhTen: Date,
			tenVietNam: String,
			tenDiaPhuong: String,
			tenTiengAnh: String,
			tenTheoBaoTang: String,
			thongTinKhac2: String
		},
		soLuongChatLuong: {
			soLuongTieuBan: Number,
			loaiMauVat: String,
			kichThuocMauMixed:{
				chieuDai: Number,
				donVi_chieuDai: String,
				chieuRong: Number,
				donVi_chieuRong: String,
				chieuCao: Number,
				donVi_chieuCao: String,
				theTich: Number,
				donVi_theTich: String,
				trongLuong: Number,
				donVi_trongLuong: String
			},
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
			thoiGianGiamDinh: Date,
			nguoiGiamDinh: String,
			coQuanToChucGiamDinh: String,
			taiLieuPhanTichMixed: {
				taiLieuPhanTichStr: String,
				taiLieuPhanTichFile: [String]
			},
			phanTichQuangHocMixed: {
				phanTichQuangHocStr: String,
				phanTichQuangHocFile: [String]
			},
			ketQuaThanhPhanVatChat: [String],
			ketQuaPhanTichDinhTuoi: [String],
			phanTichKhac: [String],
			duLieuDiaChat: {
				dacDiemDiaChat: String,
				loaiHinhNguonGoc: String,
			},
			thongTinKhac5: String
		},
		media: {
			anhMauVat: [String],
			hinhAnhNgoaiThucDia: [String],
			videoStr: String,
			videoFile: [String],
			xuLyCheTac: {
				hinhAnhDinhKem: [String],
				dinhKemXuLyCheTac: [String],
				thuocTinhXuLyCheTac: String,
				phuongThucXuLy: String,
				thoiGianXuLy: Date,
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
			phanLoaiSuDungMau: String,
			thanhPhanKhoangVat : String,
			tinhChatVatLy : String,
			congThucHoaHoc : [String],
			thanhPhanHoaHoc : String,
		},
		phanBoVaSuDung: {
			phanBoVietNamMixed: {
				phanBoVietNamStr: String,
				phanBoVietNamFile: [String],
			},
			phanBoTrenTheGioiMixed: {
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
			noiLuuTruMau: String,
			khuLuuTruMau: {
				phong: String,
				tuGia: String,
				ngan: String,
				hop: String,
			},
			giayPhepNhapMau: [String],
			hoSoNhapMauVatDiKem: [String],
			nguoiLapPhieuMauVat: String,
			nguoiNhapVaoPhanMem: String,
			thongTinKhac8: String
		},
		thongTinKhac: {
			thongTinKhac9: String
		},
		maDeTai: {
			maDeTai: String
		},
		flag: {
			fDiaDiemThuMau: String,
			fApproved: Boolean
		}
	};
	var geologicalSchema = mongoose.Schema(schemaPrototype);

	var Geological = mongoose.model("Geological", geologicalSchema);
	return Geological;
}