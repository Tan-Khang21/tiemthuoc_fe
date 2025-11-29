/**
 * Chuyển số thành chữ tiếng Việt
 * @param {number} num - Số cần chuyển
 * @returns {string} Chuỗi chữ tiếng Việt
 */
export const numberToWords = (num) => {
  if (num === 0) return 'không';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
  const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  const scales = ['', 'nghìn', 'triệu', 'tỷ'];

  const convertHundreds = (n) => {
    let str = '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    if (h > 0) {
      str += units[h] + ' trăm ';
      if (t === 0 && u > 0) str += 'lẻ ';
    }
    if (t === 1) {
      str += teens[u];
    } else if (t > 1) {
      str += tens[t] + ' ';
      if (u > 0) str += units[u];
    } else if (t === 0 && u > 0) {
      str += units[u];
    }
    return str.trim();
  };

  const convertToWords = (n) => {
    if (n === 0) return '';
    let result = '';
    let scaleIndex = 0;
    while (n > 0) {
      const chunk = n % 1000;
      if (chunk > 0) {
        const chunkWords = convertHundreds(chunk);
        result = chunkWords + ' ' + scales[scaleIndex] + ' ' + result;
      }
      n = Math.floor(n / 1000);
      scaleIndex++;
    }
    return result.trim();
  };

  const integerPart = Math.floor(Math.abs(num));
  let words = convertToWords(integerPart);
  if (num < 0) words = 'âm ' + words;
  return words.charAt(0).toUpperCase() + words.slice(1);
};