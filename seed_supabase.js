const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// BẠN NHỚ DÁN LẠI URL VÀ KEY SUPABASE CỦA BẠN VÀO ĐÂY NHÉ:
const SUPABASE_URL = 'https://tkprzrtwbshgfhwxsdqz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcHJ6cnR3YnNoZ2Zod3hzZHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNjg1MDksImV4cCI6MjA5Nzk0NDUwOX0.0SNmY74u2rnpHEC223F1ZIpZpnf3Umt3DBruxCPt7A0'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Từ điển dịch tự động để chèn vào cột 'word' (Tiếng Việt) dựa trên 'label' (Tiếng Anh)
const vietnameseDictionary = {
  'mosquito': 'Con muỗi'
};

const words = Object.keys(vietnameseDictionary);

async function uploadToSupabase() {
  for (const word of words) {
    console.log(`Đang xử lý và đẩy ${word} lên Supabase...`);
    
    const fileName = `${word}_500.json`; 
    const filePath = path.join(__dirname, fileName);
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // --- ĐỊNH DẠNG LẠI DATA GIỐNG HỆT ẢNH CỦA BẠN ---
      const formattedData = data.map(item => ({
        word: vietnameseDictionary[item.label], // Cột word: Tiếng Việt (VD: Quả táo)
        label: item.label === 'ice cream' ? 'ice_cream' : item.label, // Cột label: Tiếng Anh (xử lý riêng chữ ice_cream cho khớp ảnh 1)
        drawing: item.drawing,                  // Cột drawing: Tọa độ nét vẽ
        like_count: 0                           // Cột like_count: Cho mặc định bằng 0
      }));
      // ------------------------------------------------

      const { error } = await supabase
        .from('quickdraw_library')
        .insert(formattedData);
        
      if (error) {
          console.error(`❌ Lỗi khi đẩy ${word}:`, error.message || error);
      } else {
          console.log(`✅ Thành công: ${word} (Đã định dạng chuẩn Tiếng Việt)`);
      }
    } else {
      console.log(`⚠️ Không tìm thấy file: ${filePath}`);
    }
  }
  console.log('🎉 Đã đẩy xong toàn bộ dữ liệu mới lên Supabase!');
}

uploadToSupabase();