import React from 'react';

export default function ReadyScreen({ setScreen, currentWord }: any) {
  return (
    <div className="h-full w-full bg-sky-300 flex items-center justify-center relative p-4">
      <div className="bg-white px-6 py-8 sm:px-12 rounded-3xl border-4 lg:border-8 border-gray-800 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center transform -rotate-1 w-full max-w-lg text-center">
        <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-3 text-gray-700">Từ khóa của bé là:</h2>

        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-6 lg:mb-12 text-blue-500 uppercase break-words tracking-wide"
          style={{ textShadow: '3px 3px 0px #1f2937, -1px -1px 0 #1f2937, 1px -1px 0 #1f2937, -1px 1px 0 #1f2937, 1px 1px 0 #1f2937' }}>
          {currentWord?.word}
        </h1>

        <button
          onClick={() => setScreen('game')}
          className="bg-yellow-400 text-gray-900 text-xl sm:text-2xl lg:text-2xl font-black py-3 px-8 rounded-full border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] hover:bg-yellow-300 animate-bounce"
        >
          SẴN SÀNG!
        </button>
      </div>
    </div>
  );
}