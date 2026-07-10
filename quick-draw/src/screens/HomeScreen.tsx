import React from 'react';

const img1 = "/assets/img1.jpg";

export default function HomeScreen({ setScreen, onStart, isStarting }: any) {
  return (
    <div
      className="h-full w-full relative flex flex-col items-center p-4 lg:p-6 bg-sky-200"
      style={{
        backgroundImage: `url(${img1})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>

      {/* Header text group */}
      <div className="z-10 flex flex-col items-center mt-4 sm:mt-6 lg:mt-8 text-center w-full px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white uppercase tracking-wider"
          style={{ textShadow: '4px 4px 0px #1f2937, -2px -2px 0 #1f2937, 2px -2px 0 #1f2937, -2px 2px 0 #1f2937, 2px 2px 0 #1f2937' }}>
          Cuộc Phiêu Lưu
        </h1>
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-yellow-300 uppercase tracking-wider mt-1 lg:mt-2"
          style={{ textShadow: '4px 4px 0px #1f2937, -2px -2px 0 #1f2937, 2px -2px 0 #1f2937, -2px 2px 0 #1f2937, 2px 2px 0 #1f2937' }}>
          Vẽ Của Artie
        </h1>
      </div>

      {/* Main robot image area */}
      <div className="z-10 flex flex-1 items-center justify-center w-full relative">
        <div
          className="text-[70px] sm:text-[850px] lg:text-[100px] animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          🤖
        </div>
      </div>

      {/* Footer buttons row */}
      <div className="z-10 flex flex-col sm:flex-row justify-center items-center gap-3 lg:gap-5 mb-8 lg:mb-14 mt-auto relative w-full px-4">
        <button
          onClick={onStart}
          disabled={isStarting}
          className={`${isStarting ? 'bg-gray-400' : 'bg-cyan-300 hover:bg-cyan-200'} text-sm sm:text-base lg:text-lg font-black py-2.5 px-4 lg:py-3 lg:px-6 rounded-full border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 w-full max-w-[200px] lg:max-w-[220px] shrink-0`}
        >
          {isStarting ? (
            <><span className="text-xs sm:text-sm">⏳</span> Đang tải...</>
          ) : (
            <><span className="text-xs sm:text-sm">✏️</span> Cùng Vẽ Nào!</>
          )}
        </button>

        <button
          onClick={() => setScreen('community')}
          className="bg-yellow-400 hover:bg-yellow-300 text-sm sm:text-base lg:text-lg font-black py-2.5 px-4 lg:py-3 lg:px-6 rounded-full border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 w-full max-w-[200px] lg:max-w-[220px] shrink-0"
        >
          <span className="text-xs sm:text-sm">🌍</span> Cộng Đồng
        </button>
      </div>
    </div >
  );
}