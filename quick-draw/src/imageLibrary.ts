export const REAL_IMAGES: Record<string, string> = {
  'Quả táo': '/assets/tao.jpg',
  'Máy bay': '/assets/plane.jpg',
  'Ngôi nhà': '/assets/nha.jpg',
  'Con mèo': '/assets/meo.jpg',
  'Mặt trời': '/assets/sun.jpg',
  'Xe đạp': '/assets/xe-dap.jpg',
  'Con chim': '/assets/bird.jpg',
  'Đồng hồ': '/assets/clock.jpg',
  'Đám mây': '/assets/cloud.jpg',
  'Bánh quy': '/assets/banh.jpg',
  'Cái cốc': '/assets/coc.jpg',
  'Con mắt': '/assets/eyes.jpg',
  'Con cá': '/assets/fish.jpg',
  'Ngôi sao': '/assets/star.jpg',
  'Cái giường': '/assets/bed.jpg',
  'Máy ảnh': '/assets/camera.jpg',
  'Cánh cửa': '/assets/door.jpg',
  'Chìa khóa': '/assets/key.jpg',
  'Mặt trăng': '/assets/moon.jpg',
  'Cái ô': '/assets/umbrella.jpg',
  'Cây kem': '/assets/ice-cream.jpg',
};

// Hàm hỗ trợ để lấy ảnh an toàn (tránh lỗi nếu quên chưa thêm ảnh nào đó)
export const getImageForWord = (word: string): string => {
  return REAL_IMAGES[word] || 'https://via.placeholder.com/150?text=No+Image';
};