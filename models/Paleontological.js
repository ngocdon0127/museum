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
			thongTinKhac1Mixed: {
				thongTinKhac1Str: String,
				thongTinKhac1File: [String]
			}
		},
		tenMau: {
			tenKhoaHoc: {
				tenDongNghia: String,
				gioi: String,
				nganh: String,
				lop: String,
				phanLop: String,
				bo: String,
				lienHo: String,
				ho: String,
				phanHo: String,
				chiGiong: String,
				phanChiPhanGiong: String,
				loai: String,
				duoiLoai: String,
			},
			nguoiDinhTen: String,
			ngayDinhTen: Date,
			tenVietNam: String,
			tenDiaPhuong: String,
			tenTiengAnh: String,
			tenTheoBaoTang: String,
			thongTinKhac2Mixed: {
				thongTinKhac2Str: String,
				thongTinKhac2File: [String]
			}
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
			thongTinKhac3Mixed: {
				thongTinKhac3Str: String,
				thongTinKhac3File: [String]
			}
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
				thon: String,
				tinhKhac: String,
			},
			viTriToaDo: {
				viDo: String,
				kinhDo: String
			},
			thongTinDiaTang: String,
			thongTinDuAn: String,
			ghiChepThucDia: String,
			banDo: [String],
			thongTinKhac4Mixed: {
				thongTinKhac4Str: String,
				thongTinKhac4File: [String]
			}
		},
		duLieuPhanTichMau: {
			thoiGianGiamDinh: Date,
			nguoiGiamDinh: String,
			coQuanToChucGiamDinh: String,
			taiLieuPhanTichMixed: {
				taiLieuPhanTichStr: String,
				taiLieuPhanTichFile: [String]
			},
			ketQuaPhanTichDinhTuoi: [String],
			dacDiemViCauTruc: [String],
			dacDiemLatMong: [String],
			moTaHinhThaiStr: String,
			hinhVe: [String],
			thongTinKhac5Mixed: {
				thongTinKhac5Str: String,
				thongTinKhac5File: [String]
			}
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
			thongTinDNA: {
				vungGenPhanTich: String,
				trinhTuDNA: String,
				dinhKemTrinhTuDNA: [String],
				congBoQuocTe: String
			},
			thongTinKhac6Mixed: {
				thongTinKhac6Str: String,
				thongTinKhac6File: [String]
			}
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
			thongTinKhac7Mixed: {
				thongTinKhac7Str: String,
				thongTinKhac7File: [String]
			}
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
			thongTinKhac8Mixed: {
				thongTinKhac8Str: String,
				thongTinKhac8File: [String]
			}
		},
		thongTinKhac: {
			thongTinKhac9Mixed: {
				thongTinKhac9Str: String,
				thongTinKhac9File: [String]
			}
		},
		maDeTai: {
			maDeTai: String
		},
		flag: {
			fDiaDiemThuMau: String,
			fApproved: Boolean
		}
	};
	var paleontologicalSchema = mongoose.Schema(schemaPrototype);
	var Paleontological = mongoose.model("Paleontological", paleontologicalSchema);
	return Paleontological;
}