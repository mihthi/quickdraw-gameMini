import React, { useState } from 'react';
import MiniCanvas from '../components/MiniCanvas';

export default function SummaryScreen({ setScreen, setSelectedDrawing, gameDrawings }: any) {
  const [sharePopup, setSharePopup] = useState(false);

  const handleShare = (e: any) => {
    e.stopPropagation();
    setSharePopup(true);
  };

  return (
    <div className="h-full w-full bg-sky-200 p-3 sm:p-4 lg:p-6 flex flex-col relative overflow-hidden">
      
      <div className="flex justify-between items-center mb-2 lg:mb-4 shrink-0 gap-2">
        <button onClick={() => setScreen('home')} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full text-sm sm:text-base lg:text-xl font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0">⬅</button>
        <h1 className="flex-1 text-base sm:text-xl lg:text-2xl font-black text-gray-800 uppercase tracking-wide text-center truncate">Tóm tắt thư viện</h1>
        <div className="w-8 sm:w-10 lg:w-12 shrink-0"></div>
      </div>

      <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-center mb-2 lg:mb-4 text-white uppercase tracking-wider shrink-0"
        style={{ textShadow: '2px 2px 0px #1f2937, -1.5px -1.5px 0 #1f2937, 1.5px -1.5px 0 #1f2937, -1.5px 1.5px 0 #1f2937, 1.5px 1.5px 0 #1f2937' }}>
        Nghệ sĩ tuyệt vời!
      </h2>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-5 flex-1 px-1 lg:px-2 pb-2 min-h-0">
        {gameDrawings.map((item: any) => (
          <div key={item.id} className="bg-white rounded-xl lg:rounded-2xl border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[5px_5px_0px_0px_rgba(31,41,55,1)] p-1.5 sm:p-2 lg:p-3 flex flex-col hover:-translate-y-0.5 transition-transform overflow-hidden">

            <div
              className="w-full aspect-square border-2 sm:border-4 border-gray-200 rounded-lg lg:rounded-xl flex items-center justify-center text-3xl sm:text-4xl lg:text-6xl cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden shrink-0"
              onClick={() => { setSelectedDrawing(item); setScreen('detail'); }}
            >
              {item.drawingData && item.drawingData.length > 0 ? (
                <div className="w-full h-full pointer-events-none p-1 sm:p-2">
                  <MiniCanvas drawingData={item.drawingData} />
                </div>
              ) : (
                item.emoji
              )}
            </div>

            <div className="mt-1 sm:mt-2 text-center flex flex-col justify-between flex-1 min-h-0">
              <div>
                <span className="font-bold text-[10px] sm:text-[11px] lg:text-sm truncate block">{item.word}</span>
                {item.isWin ? (
                  <span className="text-green-500 font-black text-[9px] sm:text-[10px] lg:text-xs uppercase block mt-0.5 lg:mt-1">✅ Chính xác</span>
                ) : (
                  <span className="text-red-500 font-black text-[9px] sm:text-[10px] lg:text-xs uppercase block mt-0.5 lg:mt-1">❌ Sai rồi</span>
                )}
              </div>

              <button
                onClick={handleShare}
                className="mt-1 bg-yellow-400 hover:bg-yellow-300 text-[9px] sm:text-[10px] lg:text-xs font-black py-1 lg:py-1.5 px-2 lg:px-4 rounded-full border-2 border-gray-800 mx-auto block transition-transform active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] uppercase w-full max-w-[120px]"
              >
                Chia sẻ
              </button>
            </div>
          </div>
        ))}
      </div>

      {sharePopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border-4 border-gray-800 rounded-2xl p-6 lg:p-8 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] text-center flex flex-col items-center max-w-xs sm:max-w-md transform scale-100 transition-transform animate-bounce" style={{ animationIterationCount: 1 }}>
            <span className="text-3xl lg:text-5xl mb-2 lg:mb-4">🌟</span>
            <h3 className="text-xl lg:text-2xl font-black text-blue-500 mb-1 lg:mb-2 leading-tight">Bé vẽ rất đẹp!</h3>
            <p className="text-xs sm:text-base lg:text-lg font-bold text-gray-600 mb-4 lg:mb-6">Tác phẩm đã được chia sẻ lên Cộng Đồng để mọi người cùng xem nhé!</p>
            <button
              onClick={() => setSharePopup(false)}
              className="bg-yellow-400 text-sm lg:text-xl font-black py-2 px-6 lg:py-3 lg:px-8 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] hover:bg-yellow-300 active:translate-y-1 transition-all"
            >
              Tuyệt vời!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}