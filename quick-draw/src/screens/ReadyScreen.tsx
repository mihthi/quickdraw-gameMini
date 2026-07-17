import React from 'react';

export default function ReadyScreen({ setScreen, currentWord }: any) {
  return (
    <div className="h-full w-full bg-sky-300 flex items-center justify-center relative p-4">
      <div className="bg-white px-6 py-8 sm:px-12 rounded-3xl border-4 lg:border-8 border-gray-800 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center transform -rotate-1 w-full max-w-lg text-center">
        <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-3 text-gray-700">Từ khóa của bé là:</h2>

        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-10 text-blue-500 uppercase break-words tracking-wide"
          style={{ textShadow: '3px 3px 0px #1f2937, -1px -1px 0 #1f2937, 1px -1px 0 #1f2937, -1px 1px 0 #1f2937, 1px 1px 0 #1f2937' }}>
          {currentWord?.word}
        </h1>

        {/* Nút SẴN SÀNG to ra và đưa lên trên */}
        <button
          onClick={() => setScreen('game')}
          className="bg-yellow-400 text-gray-900 text-3xl sm:text-4xl font-black py-4 px-12 rounded-full border-[4px] lg:border-[5px] border-gray-800 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] hover:bg-yellow-300 animate-bounce transition-all mb-5"
        >
          SẴN SÀNG!
        </button>

        {/* Dòng thời gian nhỏ lại, viền mỏng hơn và nằm dưới */}
        <div className="flex items-center justify-center gap-1.5 bg-pink-300 px-4 py-1.5 rounded-full border-[3px] border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] opacity-90">
          <span className="text-sm sm:text-base animate-pulse">⏱️</span>
          <span className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wide">
            Thời gian vẽ: 20 giây
          </span>
        </div>
      </div>
    </div>
  );
}