const fs = require('fs');

// Đã cập nhật đúng 20 từ khóa dựa trên hình ảnh của bạn
const words = [
  // 'cookie', 'cup', 'bed', 'umbrella', 'door', 
  // 'ice cream', 'key', 'fish', 
  'bread',
  'bridge'
];

const LIMIT = 500; // Lấy 500 ảnh cho mỗi từ

async function fetchWord(word) {
  try {
    console.log(`Đang tải dữ liệu cho: ${word}...`);
    const urlWord = encodeURIComponent(word);
    const url = `https://storage.googleapis.com/quickdraw_dataset/full/raw/${urlWord}.ndjson`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Lỗi mạng: ${response.statusText}`);

    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    const results = [];
    for (let i = 0; i < LIMIT && i < lines.length; i++) {
      const data = JSON.parse(lines[i]);
      results.push({
        label: data.word, // Cập nhật thành label cho khớp với table AI
        drawing: data.drawing
      });
    }

    // Đổi tên file thành 500 để dễ quản lý
    fs.writeFileSync(`${word}_500.json`, JSON.stringify(results, null, 2));
    console.log(`✅ Hoàn thành: ${word} (Đã lưu ${results.length} hình)`);
  } catch (error) {
    console.error(`❌ Lỗi khi tải ${word}:`, error.message);
  }
}

async function main() {
  for (const word of words) {
    await fetchWord(word);
  }
  console.log('🎉 Đã lấy xong toàn bộ 20 từ (Tổng cộng 10000 ảnh)!');
}

main();