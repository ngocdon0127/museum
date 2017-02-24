module.exports = function (mongoose) {
	var schemaPrototype = {
		created_at: Date,
		updated_at: Date,
		deleted_at: Date,
		soHieu: {
			soHieuBTTNVN: String,
			soHieuBaoTangCS: String,
			soHieuThucDia: String,
			kyHieuMauVatKhac: String,
			thongTinKhac1: String
		},
		tenMau: {
			tenKhoaHoc: {
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
				phanGiong: String,
				loai: String,
				duoiLoai: String
			},
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
			taiLieuPhanTichMixed: {
				taiLieuPhanTichStr: String,
				taiLieuPhanTichFile: [String]
			},
			moTaHinhThaiMixed: {
				moTaHinhThaiStr: String,
				moTaHinhThaiFile: [String]
			},
			gioiTinh: String,
			giaiDoanSong: String,
			hinhVe: [String],
			thongTinKhac5: String
		},
		media: {
			anhMauVat: [String],
			hinhAnhNgoaiThucDia: [String],
			videoStr: String,
			videoFile: [String],
			xuLyCheTac: {
				hinhAnhDinhKem: [String],
				dinhKemXuLy: [String],
				thuocTinhXuLy: [String],
				phuongThucXuLy: String,
				thoiGianXuLy: Date,
				nguoiXuLy: String,
				coQuanXuLy: String,
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
			nguoiNhapPhieuMauVat: String,
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
			fDiaDiemThuMau: String
		}
	};
	var animalSchema = mongoose.Schema(schemaPrototype);
	var Animal = mongoose.model("Animal", animalSchema);
	return Animal;
}