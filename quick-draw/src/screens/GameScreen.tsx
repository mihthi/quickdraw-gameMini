import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../aiService';
import { REAL_IMAGES } from '../imageLibrary';

export default function GameScreen({ setScreen, currentWord, onNextRound, hintsLeft, setHintsLeft, isAiReady }: any) {
  const [aiGuess, setAiGuess] = useState("AI đang xem bé vẽ...");
  const [hintStatus, setHintStatus] = useState<'IDLE' | 'SHOWING' | 'HIDING'>('IDLE');
  const [timeLeft, setTimeLeft] = useState(20);
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser'>('brush');

  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [strokes, setStrokes] = useState<any[]>([]);
  const strokesRef = useRef<any[]>([]);
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<{ x: number[], y: number[] }>({ x: [], y: [] });

  const isRoundEndedRef = useRef(false);

  const runAIPrediction = async () => {
    if (!canvasRef.current || isCorrect || !isAiReady || isRoundEndedRef.current) return;

    const result = await aiService.predict(canvasRef.current);

    if (!result || isRoundEndedRef.current) {
      if (strokes.length > 0 && !isRoundEndedRef.current) {
        setAiGuess("Đang suy nghĩ... Vẽ thêm chút nữa đi!");
      }
      return;
    }

    if (result.label === currentWord?.label) {
      isRoundEndedRef.current = true;
      setIsCorrect(true);
      setAiGuess(`🎉 ĐÚNG RỒI! Là ${currentWord?.word.toUpperCase()}!`);

      setTimeout(() => {
        onNextRound(strokesRef.current, true);
      }, 1500);
    } else {
      setAiGuess(`🤔 Hình như là... ${result.word}?`);
    }
  };

  useEffect(() => {
    if (isCorrect || !isAiReady) return;
    if (strokes.length === 0) return;

    const timer = setTimeout(() => {
      runAIPrediction();
    }, 200); 

    return () => clearTimeout(timer);
  }, [strokes, isCorrect, isAiReady]);

  useEffect(() => {
    setIsCorrect(false);
    setTimeLeft(20);
    isRoundEndedRef.current = false; 
    handleClearCanvas();

    if (!isAiReady) setAiGuess("Đang khởi động AI...");
    else setAiGuess("Hãy vẽ đi, AI đang xem...");
  }, [currentWord, isAiReady]);

  const handleShowHint = () => {
    if (hintsLeft > 0 && hintStatus === 'IDLE') {
      setHintsLeft((prev: number) => prev - 1);
      setHintStatus('SHOWING');
      setTimeout(() => setHintStatus('HIDING'), 3000);
      setTimeout(() => setHintStatus('IDLE'), 3500);
    }
  };

  useEffect(() => {
    if (isCorrect) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentWord, isCorrect]);

  useEffect(() => {
    if (timeLeft === 0 && !isCorrect && !isRoundEndedRef.current) {
      isRoundEndedRef.current = true; 
      if (isDrawingRef.current && currentPathRef.current.x.length > 0) {
        const newStroke = [currentPathRef.current.x, currentPathRef.current.y];
        strokesRef.current = [...strokesRef.current, newStroke];
      }

      onNextRound(strokesRef.current, false);
    }
  }, [timeLeft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [currentWord]);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setStrokes([]);
    strokesRef.current = []; 
    setAiGuess("Hãy vẽ đi, AI đang xem...");
  };

  const startDrawing = (e: any) => {
    if (isCorrect) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    isDrawingRef.current = true;
    currentPathRef.current = { x: [x], y: [y] };
  };

  const draw = (e: any) => {
    if (!isDrawingRef.current || isCorrect) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 12;

      currentPathRef.current.x.push(x);
      currentPathRef.current.y.push(y);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawingRef.current && currentPathRef.current.x.length > 0) {
      const newStroke = [currentPathRef.current.x, currentPathRef.current.y];
      strokesRef.current = [...strokesRef.current, newStroke];
      setStrokes(strokesRef.current);
    }

    isDrawingRef.current = false;
    currentPathRef.current = { x: [], y: [] };

    setTimeout(() => {
      runAIPrediction();
    }, 50);
  };

 return (
    <div className="h-full w-full bg-emerald-200 p-3 sm:p-4 lg:p-4 flex flex-col relative">
      
      <div className="flex justify-between items-center mb-2.5 lg:mb-3 z-10 gap-2 w-full shrink-0">
        <div className="flex items-center gap-2 lg:gap-2 flex-1 min-w-0">
          {/* ĐÃ SỬA: Tăng kích thước nút back */}
          <button onClick={() => setScreen('home')} className="w-10 h-10 sm:w-11 sm:h-11 lg:w-11 lg:h-11 bg-white border-4 border-gray-800 rounded-full flex justify-center items-center text-sm sm:text-base lg:text-lg font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] hover:bg-gray-100 active:translate-y-1 active:shadow-none shrink-0">⬅</button>
          <h2 className="text-sm sm:text-base lg:text-lg font-black bg-white px-3 sm:px-4 lg:px-5 py-2 sm:py-2 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] text-blue-600 truncate">
            Vẽ: {currentWord?.word?.toUpperCase()}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className={`bg-white px-3 sm:px-4 lg:px-4 py-2 sm:py-2 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] text-xs sm:text-sm lg:text-base font-black flex items-center gap-0.5 ${isCorrect ? 'text-green-500' : ''}`}>
            ⏱️{timeLeft}s
          </div>
          <button
            onClick={handleShowHint}
            disabled={hintsLeft === 0 || hintStatus !== 'IDLE' || isCorrect}
            className={`${hintsLeft === 0 || hintStatus !== 'IDLE' || isCorrect ? 'bg-gray-400 opacity-80' : 'bg-yellow-400 hover:bg-yellow-300 active:translate-y-1'} text-xs sm:text-sm lg:text-base font-black py-2 sm:py-2 px-3 sm:px-4 lg:px-4 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] active:shadow-none flex items-center gap-1 transition-all`}
          >
            💡 Gợi ý {hintsLeft > 0 && `(${hintsLeft})`}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl lg:rounded-[2rem] border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] relative flex flex-col items-center justify-center overflow-hidden touch-none min-h-0">

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`absolute inset-0 w-full h-full ${activeTool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'} ${isCorrect ? 'pointer-events-none opacity-80' : ''}`}
        />

        {!isCorrect && (
          <>
            <div className="absolute top-2 left-2 lg:top-3 lg:left-3 flex flex-col gap-2 lg:gap-2 z-10">
              {/* ĐÃ SỬA: Tăng w-10 h-10 cho nút cọ và tẩy */}
              <button
                onClick={() => setActiveTool('brush')}
                className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-11 lg:h-11 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-base lg:text-lg transition-all ${activeTool === 'brush' ? 'bg-cyan-300 scale-110 shadow-none translate-y-1' : 'bg-white hover:bg-gray-100 active:translate-y-1 active:shadow-none'}`}
                title="Dùng cọ vẽ"
              >
                🖌️
              </button>
              <button
                onClick={() => setActiveTool('eraser')}
                className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-11 lg:h-11 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-base lg:text-lg transition-all ${activeTool === 'eraser' ? 'bg-pink-300 scale-110 shadow-none translate-y-1' : 'bg-white hover:bg-gray-100 active:translate-y-1 active:shadow-none'}`}
                title="Dùng cục tẩy"
              >
                🧽
              </button>
            </div>

            {/* ĐÃ SỬA: Tăng kích thước nút xóa */}
            <button
              onClick={handleClearCanvas}
              className="absolute bottom-2 right-2 lg:bottom-3 lg:right-3 w-10 h-10 sm:w-11 sm:h-11 lg:w-11 lg:h-11 bg-red-400 hover:bg-red-300 text-white rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-base lg:text-lg active:translate-y-1 active:shadow-none transition-all z-10"
              title="Xóa hình vẽ"
            >
              🗑️
            </button>
          </>
        )}

        {hintStatus !== 'IDLE' && (
          <div
            className={`absolute top-2 right-2 z-20 transition-all duration-500 ease-in-out ${hintStatus === 'SHOWING'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-12 pointer-events-none'
              }`}
          >
            <div className="bg-white border-4 border-gray-800 rounded-xl p-3 lg:p-3 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center animate-float">
              <img
                src={REAL_IMAGES[currentWord?.word]}
                alt={currentWord?.word}
                className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-lg"
              />
              <span className="font-black text-gray-700 text-xs lg:text-sm uppercase mt-1">{currentWord?.word}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center gap-3 mt-3 lg:mt-3 shrink-0">
        <div className={`text-4xl sm:text-4xl lg:text-4xl ${isCorrect ? 'animate-bounce' : 'animate-pulse'}`}>🤖</div>

        <div className={`${isCorrect ? 'bg-green-500' : 'bg-blue-500'} text-white font-bold text-sm sm:text-base lg:text-base px-5 lg:px-5 py-2.5 lg:py-2.5 rounded-2xl rounded-tl-none border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] w-full max-w-sm lg:max-w-md text-center break-words transition-colors`}>
          {aiGuess}
        </div>
      </div>
    </div>
  );
}