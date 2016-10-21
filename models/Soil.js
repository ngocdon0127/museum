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
			mauChatOViTriThumau: String,
			doCao: Number,
			doSau : Number,
			doDocNoiThuMau: Number,
			mucNuocNgamNoiThuMau: Number,
			khaNangThoatNuoc: String,
			thoiTietKhiThuMau: String,
			dangDiaHinhNoiThuMau: String,
			thamThucVatNoiThuMau: String,
			ghiChepThucDia: String,
		},
		duLieuPhanTichMau: {
			ngayPhanTich: Date,
			hoSoPhanTichMauDat: [String],
			ketQuaPhanTich: [String]
		},
		duLieuGiamDinhMau: {
			thoiGianGiamDinhMau: Date,
			nguoiGiamDinhMau: String,
			coQuanToChucGiamDinh: String,
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
				taiLieuDiKem: [String]
			}
		},
		phanBoVaSuDung: {
			phanBoVietNamStr: String,
			phanBoVietNamFile: [String],
			phanBoTrenTheGioiStr: String,
			phanBoTrenTheGioiFile: [String],
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
			giayPhepNhapMau: [String],
			hoSoNhapMauVatDiKem: [String],
			nguoiNhapPhieuMauVat: String,
			nguoiNhapVaoPhanMem: String
		},
		
		thongTinKhac: {
			thongTinKhac: String
		}
	};
	var soilSchema = mongoose.Schema(schemaPrototype);

	var Soil = mongoose.model("Soil", soilSchema);
	return Soil;
}