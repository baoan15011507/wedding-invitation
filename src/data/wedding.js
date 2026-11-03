export const wedding = {
  groom: {
    shortName: 'Bảo Ân',
    fullName: 'Trần Bảo Ân',
    role: 'Trưởng Nam',
    initial: 'A',
  },
  bride: {
    shortName: 'Uyên Trang',
    fullName: 'Trần Thị Uyên Trang',
    role: 'Út Nữ',
    initial: 'T',
  },
  groomFamily: {
    label: 'Nhà Trai',
    father: 'TRẦN TÝ',
    mother: 'NGUYỄN THỊ BÌNH',
    address: 'TDP Phước Thiện Xuân, P. Hàm Thắng, T. Lâm Đồng',
  },
  brideFamily: {
    label: 'Nhà Gái',
    father: 'TRẦN TÍNH',
    mother: 'LƯƠNG THỊ NHÀN',
    address: 'Thôn Phú Mỹ, X. Tuyên Quang, T. Lâm Đồng',
  },
  party: {
    venueType: 'TƯ GIA',
    address: 'NHÀ BÁC BẢY — X566+FPC, HÀM THẮNG, LÂM ĐỒNG',
    time: '11 GIỜ 00',
    weekday: 'CHỦ NHẬT',
    day: 29,
    month: 11,
    year: 2026,
    lunar: 'NHẰM NGÀY 21 THÁNG 10 NĂM BÍNH NGỌ',
  },
  ceremony: {
    venueType: 'TƯ GIA',
    time: '10 GIỜ 30',
    weekday: 'CHỦ NHẬT',
    day: 29,
    month: 11,
    year: 2026,
    lunar: 'Nhằm ngày 21 tháng 10 năm Bính Ngọ',
  },
  calendar: {
    monthLabel: 'Tháng 11 năm 2026',
    year: 2026,
    month: 11,
    highlightDay: 29,
    // Tuần bắt đầu Thứ 2; 1/11/2026 là Chủ nhật → 6 ô trống
    startWeekday: 6,
    daysInMonth: 30,
    weekdays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  },
  copy: {
    inviteLead: 'TRÂN TRỌNG KÍNH MỜI',
    inviteBody: 'ĐẾN DỰ BUỔI TIỆC CHUNG VUI CÙNG GIA ĐÌNH CHÚNG TÔI TẠI',
    closing: 'Rất hân hạnh được đón tiếp!',
    saveTheDate: 'SAVE THE DATE',
    announce: 'Trân trọng báo tin lễ thành hôn của',
    ceremonyLead: 'HÔN LỄ ĐƯỢC CỬ HÀNH TẠI TƯ GIA VÀO LÚC',
    openHint: 'Chạm để mở thiệp',
    nextPage: 'Xem mặt chính thức',
    prevPage: 'Quay lại thiệp mời',
  },

  /**
   * Chỉ đường — điểm chi tiết nằm trong src/data/street-route.json
   * (tạo bằng: npm run route:build). Không cần Maps JavaScript API.
   */
  directions: {
    destinationLabel: 'Nhà Bác Bảy, X566+FPC',
  },
}
