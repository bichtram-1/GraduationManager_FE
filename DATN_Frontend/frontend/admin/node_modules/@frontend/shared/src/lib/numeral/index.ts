import numeral from "numeral";

// Đăng ký (chỉ cần làm 1 lần lúc khởi tạo app)
numeral.register('locale', 'vi', {
  delimiters: { thousands: '.', decimal: ',' },
  abbreviations: { thousand: 'k', million: 'tr', billion: 'tỷ', trillion: 'ng' },
  ordinal: () => ".",
  currency: { symbol: '₫' },
});
numeral.register('locale', 'ko', {
  delimiters: { thousands: ',', decimal: '.' },
  abbreviations: { thousand: '천', million: '백만', billion: '십억', trillion: '조' },
  ordinal: () => "번째",
  currency: { symbol: '₩' },
});

export default numeral;
