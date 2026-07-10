import React from 'react';

// Khai báo 2 đường dẫn ảnh
const img1_desktop = "/assets/img1.jpg";
const img1_mobile = "/assets/background-for-phone.png"; // <-- Ảnh dọc bạn chuẩn bị cho điện thoại

export default function HomeScreen({ setScreen, onStart, isStarting }: any) {
  return (
    <div className="h-full w-full relative flex flex-col items-center justify-center lg:justify-normal p-4 lg:p-6 bg-sky-200 overflow-hidden">
      
      {/* ẢNH NỀN CHO ĐIỆN THOẠI (Chỉ hiện trên mobile, tự động cắt (cover) cho vừa màn hình) */}
      <img 
        src={img1_mobile} 
        alt="background mobile" 
        className="absolute inset-0 w-full h-full object-cover block lg:hidden pointer-events-none"
      />

      {/* ẢNH NỀN CHO LAPTOP/IPAD (Chỉ hiện trên màn hình lớn, ép giãn 100% như cũ) */}
      <img 
        src={img1_desktop} 
        alt="background desktop" 
        className="absolute inset-0 w-full h-full hidden lg:block pointer-events-none" 
        style={{ objectFit: 'fill' }} 
      />

      {/* Lớp màng mờ che lên ảnh nền */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none z-0"></div>

      {/* --- NỘI DUNG CHÍNH (Tiêu đề) --- */}
      <div className="z-10 flex flex-col items-center mt-4 sm:mt-8 lg:mt-8 text-center w-full px-4 shrink-0">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-wider"
          style={{ textShadow: '4px 4px 0px #1f2937, -2px -2px 0 #1f2937, 2px -2px 0 #1f2937, -2px 2px 0 #1f2937, 2px 2px 0 #1f2937' }}>
          Cuộc Phiêu Lưu
        </h1>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-yellow-300 uppercase tracking-wider mt-2 lg:mt-2"
          style={{ textShadow: '4px 4px 0px #1f2937, -2px -2px 0 #1f2937, 2px -2px 0 #1f2937, -2px 2px 0 #1f2937, 2px 2px 0 #1f2937' }}>
          Vẽ Của Artie
        </h1>
      </div>

      {/* --- NỘI DUNG CHÍNH (Robot) --- */}
      <div className="z-10 flex my-auto lg:flex-1 items-center justify-center w-full relative min-h-0 py-8 lg:py-0">
        <div
          className="text-[100px] sm:text-[120px] lg:text-[100px] animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          🤖
        </div>
      </div>

      {/* --- NỘI DUNG CHÍNH (2 Nút bấm) --- */}
      <div className="z-10 flex flex-col sm:flex-row justify-center items-center gap-3 lg:gap-5 mb-6 lg:mb-14 lg:mt-auto relative w-full px-4 shrink-0">
        <button
          onClick={onStart}
          disabled={isStarting}
          className={`${isStarting ? 'bg-gray-400' : 'bg-cyan-300 hover:bg-cyan-200'} text-base sm:text-lg lg:text-lg font-black py-3 px-6 lg:py-3 lg:px-6 rounded-full border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 w-full max-w-[220px] shrink-0`}
        >
          {isStarting ? (
            <><span className="text-sm sm:text-base">⏳</span> Đang tải...</>
          ) : (
            <><span className="text-sm sm:text-base">✏️</span> Cùng Vẽ Nào!</>
          )}
        </button>

        <button
          onClick={() => setScreen('community')}
          className="bg-yellow-400 hover:bg-yellow-300 text-base sm:text-lg lg:text-lg font-black py-3 px-6 lg:py-3 lg:px-6 rounded-full border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 w-full max-w-[220px] shrink-0"
        >
          <span className="text-sm sm:text-base">🌍</span> Cộng Đồng
        </button>
      </div>
    </div >
  );
}