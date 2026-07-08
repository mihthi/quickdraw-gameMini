import React, { useState, useEffect, useRef } from 'react';
//import img1 from "../assets/img1.jpg"; // Đã sửa đường dẫn chuẩn xác dựa trên cấu trúc thư mục của bạn
import { REAL_IMAGES } from './imageLibrary';
import { supabase } from './supabaseClient';
import { aiService } from './aiService';

const img1 = "/assets/img1.jpg";

// --- MAIN APP COMPONENT ---
export default function DrawingGameApp() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedDrawing, setSelectedDrawing] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);

  // 1. TẠO STATE MỚI ĐỂ LƯU 3 TỪ KHÓA SẼ CHƠI
  const [gameDrawings, setGameDrawings] = useState<any[]>([]);
  const [isStarting, setIsStarting] = useState(false); // Trạng thái loading khi đang lấy từ khóa

  const [isAiReady, setIsAiReady] = useState(false);

  useEffect(() => {
    // Gọi AI thức dậy từ file aiService
    aiService.load().then(() => {
      setIsAiReady(true);
    });
  }, []);


  // 2. HÀM BẮT ĐẦU GAME & LẤY TỪ KHÓA NGẪU NHIÊN TỪ SUPABASE
  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      // Thay 'game_words' bằng tên bảng chứa 20 từ khóa thực tế của bạn trên Supabase
      const { data, error } = await supabase.from('game_words').select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        // Thuật toán Fisher-Yates (Hoặc sort ngẫu nhiên) để xáo trộn 20 từ khóa
        const shuffledWords = [...data].sort(() => 0.5 - Math.random());

        // Lấy đúng 3 từ đầu tiên
        const random3Words = shuffledWords.slice(0, 3).map((dbWord, index) => ({
          id: index + 1,       // Tạo ID ảo cho lượt chơi này
          word: dbWord.word,   // Tên từ khóa (VD: Quả táo)
          emoji: dbWord.emoji, // Biểu tượng (VD: 🍎)
          label: dbWord.label, // Dùng để nạp cho AI nhận diện sau này
          user: 'Bạn',
          shared: false,
          drawingData: null    // Chuẩn bị sẵn chỗ để mốt lưu chuỗi tọa độ JSON nét vẽ
        }));

        setGameDrawings(random3Words); // Nạp 3 từ khóa vào bộ nhớ game
        setCurrentRound(0);
        setHintsLeft(3);
        setCurrentScreen('ready'); // Chuyển sang màn hình Sẵn sàng
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách từ khóa:", error);
      alert("Không thể tải từ khóa, vui lòng kiểm tra kết nối!");
    } finally {
      setIsStarting(false);
    }
  };

  const handleNextRound = (drawingData: any, isWin: boolean) => {
    // Dùng setCurrentRound làm gốc để lấy đúng index của vòng vừa chơi xong
    setCurrentRound(prevRound => {
      // 1. Lưu kết quả vào đúng mảng
      setGameDrawings(prevDrawings => {
        const updated = [...prevDrawings];
        if (updated[prevRound]) {
          updated[prevRound].drawingData = drawingData;
          updated[prevRound].isWin = isWin;
        }
        return updated;
      });

      // 2. Tính toán vòng tiếp theo
      const nextRound = prevRound + 1;
      if (nextRound < 3) { // Chốt cứng số 3 vì game luôn có 3 từ khóa
        setCurrentScreen('ready');
        return nextRound;
      } else {
        setCurrentScreen('summary');
        return prevRound;
      }
    });
  };

  const currentWordObj = gameDrawings[currentRound] || null;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        // Truyền thêm prop isStarting để làm hiệu ứng loading cho nút bấm
        return <HomeScreen setScreen={setCurrentScreen} onStart={handleStartGame} isStarting={isStarting} />;
      case 'ready':
        return <ReadyScreen setScreen={setCurrentScreen} currentWord={currentWordObj} />;
      case 'game':
        //return <GameScreen setScreen={setCurrentScreen} currentWord={currentWordObj} onNextRound={handleNextRound} hintsLeft={hintsLeft} setHintsLeft={setHintsLeft} />;
        return <GameScreen
          setScreen={setCurrentScreen}
          currentWord={currentWordObj}
          onNextRound={handleNextRound}
          hintsLeft={hintsLeft}
          setHintsLeft={setHintsLeft}
          isAiReady={isAiReady}
        />;
      case 'summary':
        // Truyền mảng 3 từ khóa vào màn hình tổng kết để nó biết phải in ra cái gì
        return <SummaryScreen setScreen={setCurrentScreen} setSelectedDrawing={setSelectedDrawing} gameDrawings={gameDrawings} />;
      case 'detail':
        return <DetailScreen setScreen={setCurrentScreen} drawing={selectedDrawing} />;
      case 'community':
        return <CommunityScreen setScreen={setCurrentScreen} />;
      default:
        return <HomeScreen setScreen={setCurrentScreen} onStart={handleStartGame} isStarting={false} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 lg:p-6 font-sans text-gray-900 select-none">
      <div className="w-full h-[100dvh] lg:h-auto lg:aspect-[4/3] max-w-5xl bg-white lg:rounded-[3rem] lg:shadow-[12px_12px_0px_0px_rgba(31,41,55,1)] lg:border-[12px] border-gray-800 overflow-hidden relative flex flex-col">
        {renderScreen()}
      </div>
    </div>
  );
}


// --- SCREEN 1: HOME SCREEN ---
function HomeScreen({ setScreen, onStart, isStarting }: any) {
  return (
    <div
      className="h-full w-full relative flex flex-col items-center justify-between py-10 px-4 lg:py-12 lg:px-8 bg-sky-200"
      style={{
        backgroundImage: `url(${img1})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>

      {/* Tiêu đề tự động co giãn theo màn hình (ĐÃ SỬA LỖI FONT TRÊN MOBILE) */}
      <div className="z-10 mt-12 lg:mt-8 relative px-4 text-center transform scale-90 sm:scale-100 transition-transform">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white uppercase tracking-wider"
          style={{ textShadow: '4px 4px 0px #1f2937, -2px -2px 0 #1f2937, 2px -2px 0 #1f2937, -2px 2px 0 #1f2937, 2px 2px 0 #1f2937' }}>
          Cuộc Phiêu Lưu
        </h1>
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-yellow-300 uppercase tracking-wider mt-2 lg:mt-4"
          style={{ textShadow: '4px 4px 0px #1f2937, -2px -2px 0 #1f2937, 2px -2px 0 #1f2937, -2px 2px 0 #1f2937, 2px 2px 0 #1f2937' }}>
          Vẽ Của Artie
        </h1>
      </div>

      {/* Robot Emoji tự động căn chỉnh kích cỡ tương thích mobile và laptop */}
      <div
        className="z-10 absolute top-[45%] sm:top-[50%] lg:top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[90px] sm:text-[130px] lg:text-[180px] animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        🤖
      </div>

      {/* Khu vực nút bấm: Đã canh giữa và ép kích thước bằng nhau */}
      <div className="z-10 flex flex-col sm:flex-row justify-center gap-4 lg:gap-8 mb-8 lg:mb-12 mt-auto relative w-full px-6">
        <button
          onClick={onStart}
          disabled={isStarting}
          className={`${isStarting ? 'bg-gray-400' : 'bg-cyan-300 hover:bg-cyan-200'} text-lg sm:text-xl lg:text-3xl font-black py-3.5 px-4 rounded-full border-4 border-gray-800 shadow-[5px_5px_0px_0px_rgba(31,41,55,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 w-full sm:w-[220px] lg:w-[320px] shrink-0`}
        >
          {isStarting ? '⏳ Đang tải...' : '✏️ Cùng Vẽ Nào!'}
        </button>

        <button
          onClick={() => setScreen('community')}
          className="bg-yellow-400 hover:bg-yellow-300 text-base sm:text-xl lg:text-3xl font-black py-3.5 px-4 rounded-full border-4 border-gray-800 shadow-[5px_5px_0px_0px_rgba(31,41,55,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 w-full sm:w-[220px] lg:w-[320px] shrink-0"
        >
          🌍 Cộng Đồng
        </button>
      </div>
    </div>
  );
}

// --- SCREEN 2: READY SCREEN ---
function ReadyScreen({ setScreen, currentWord }: any) {
  return (
    <div className="h-full w-full bg-sky-300 flex items-center justify-center relative p-4">
      <div className="bg-white px-6 py-8 sm:px-12 rounded-3xl border-4 lg:border-8 border-gray-800 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center transform -rotate-1 w-full max-w-lg text-center">
        <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-3 text-gray-700">Từ khóa của bé là:</h2>

        {/* BỎ TRUNCATE, THÊM BREAK-WORDS ĐỂ CHỮ XUỐNG DÒNG */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 lg:mb-12 text-blue-500 uppercase break-words tracking-wide"
          style={{ textShadow: '3px 3px 0px #1f2937, -1px -1px 0 #1f2937, 1px -1px 0 #1f2937, -1px 1px 0 #1f2937, 1px 1px 0 #1f2937' }}>
          {currentWord?.word}
        </h1>

        <button
          onClick={() => setScreen('game')}
          className="bg-yellow-400 text-gray-900 text-xl sm:text-2xl lg:text-4xl font-black py-3 px-8 rounded-full border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] hover:bg-yellow-300 animate-bounce"
        >
          SẴN SÀNG!
        </button>
      </div>
    </div>
  );
}

// --- SCREEN 3: GAMEPLAY SCREEN ---
// --- SCREEN 3: GAMEPLAY SCREEN ---

function GameScreen({ setScreen, currentWord, onNextRound, hintsLeft, setHintsLeft, isAiReady }: any) {
  const [aiGuess, setAiGuess] = useState("AI đang xem bé vẽ...");
  const [hintStatus, setHintStatus] = useState<'IDLE' | 'SHOWING' | 'HIDING'>('IDLE');
  const [timeLeft, setTimeLeft] = useState(20);
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser'>('brush');

  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [strokes, setStrokes] = useState<any[]>([]);
  const strokesRef = useRef<any[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number[], y: number[] }>({ x: [], y: [] });

  // THÊM DÒNG NÀY: Khóa chống gọi đúp chuyển vòng
  const isRoundEndedRef = useRef(false);

  const runAIPrediction = async () => {
    // Nếu đã đóng khóa thì không làm gì cả
    if (!canvasRef.current || isCorrect || !isAiReady || isRoundEndedRef.current) return;

    const result = await aiService.predict(canvasRef.current);

    // Kiểm tra lại khóa sau khi await (Đề phòng lúc chờ AI thì hết giờ)
    if (!result || isRoundEndedRef.current) {
      if (strokes.length > 0 && !isRoundEndedRef.current) {
        setAiGuess("Đang suy nghĩ... Vẽ thêm chút nữa đi!");
      }
      return;
    }

    if (result.label === currentWord?.label) {
      isRoundEndedRef.current = true; // ĐÓNG KHÓA NGAY LẬP TỨC
      setIsCorrect(true);
      setAiGuess(`🎉 ĐÚNG RỒI! Là ${currentWord?.word.toUpperCase()}!`);

      setTimeout(() => {
        onNextRound(strokesRef.current, true);
      }, 1500);
    } else {
      setAiGuess(`🤔 Hình như là... ${result.word}?`);
    }
  };

  // Hẹn giờ dự đoán liên tục
  useEffect(() => {
    // Nếu đã đoán đúng hoặc AI chưa sẵn sàng thì không làm gì cả
    if (isCorrect || !isAiReady) return;

    // Chỉ chạy dự đoán khi có nét vẽ (strokes.length > 0)
    if (strokes.length === 0) return;

    const timer = setTimeout(() => {
      runAIPrediction();
    }, 200); // Chờ 0.2 giây sau khi người dùng ngừng vẽ mới gọi AI

    return () => clearTimeout(timer);
  }, [strokes, isCorrect, isAiReady]);

  // Cập nhật câu chào ban đầu
  useEffect(() => {
    setIsCorrect(false);
    setTimeLeft(20);
    isRoundEndedRef.current = false; // THÊM DÒNG NÀY ĐỂ MỞ KHÓA
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

  // 2. ĐÃ SỬA: Dừng đếm ngược thời gian nếu đã đoán đúng
  useEffect(() => {
    if (isCorrect) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentWord, isCorrect]);

  // 3. ĐÃ SỬA: Chuyển vòng khi hết giờ (Khóa nếu đã đoán đúng)
  useEffect(() => {
    if (timeLeft === 0 && !isCorrect && !isRoundEndedRef.current) {
      isRoundEndedRef.current = true; // ĐÓNG KHÓA NGAY LẬP TỨC
      onNextRound(strokesRef.current, false);
    }
  }, [timeLeft]);

  // }, [timeLeft, onNextRound, strokes, isCorrect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        // --- THÊM PHẦN NÀY ĐỂ TÔ NỀN TRẮNG ---
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
    strokesRef.current = []; // THÊM DÒNG NÀY ĐỂ XÓA SỔ TỨC THỜI
    setAiGuess("Hãy vẽ đi, AI đang xem...");
  };

  const startDrawing = (e: any) => {
    if (isCorrect) return; // 4. ĐÃ SỬA: Khóa vẽ khi thắng
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setCurrentPath({ x: [x], y: [y] });
  };

  const draw = (e: any) => {
    if (!isDrawing || isCorrect) return; // 4. ĐÃ SỬA: Khóa vẽ khi thắng
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
      setCurrentPath(prev => ({
        x: [...prev.x, x],
        y: [...prev.y, y]
      }));
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && currentPath.x.length > 0) {
      const newStroke = [currentPath.x, currentPath.y];

      // Lưu ngay vào sổ chớp nhoáng trước
      strokesRef.current = [...strokesRef.current, newStroke];

      // Sau đó mới báo cho React cập nhật giao diện
      setStrokes(strokesRef.current);
    }
    setIsDrawing(false);

    setTimeout(() => {
      runAIPrediction();
    }, 50);
  };

  return (
    <div className="h-full w-full bg-emerald-200 p-3 sm:p-5 lg:p-8 flex flex-col relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 lg:mb-6 z-10 gap-2 w-full">
        <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
          <button onClick={() => setScreen('home')} className="w-9 h-9 sm:w-11 sm:h-11 lg:w-14 lg:h-14 bg-white border-4 border-gray-800 rounded-full flex justify-center items-center text-sm sm:text-base lg:text-2xl font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] hover:bg-gray-100 active:translate-y-1 active:shadow-none shrink-0">⬅</button>
          <h2 className="text-sm sm:text-lg lg:text-4xl font-black bg-white px-3 sm:px-5 lg:px-8 py-1.5 sm:py-2 lg:py-3 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] text-blue-600 truncate">
            Vẽ: {currentWord?.word?.toUpperCase()}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className={`bg-white px-2.5 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] text-xs sm:text-base lg:text-2xl font-black flex items-center gap-0.5 ${isCorrect ? 'text-green-500' : ''}`}>
            ⏱️{timeLeft}s
          </div>
          <button
            onClick={handleShowHint}
            disabled={hintsLeft === 0 || hintStatus !== 'IDLE' || isCorrect}
            className={`${hintsLeft === 0 || hintStatus !== 'IDLE' || isCorrect ? 'bg-gray-400 opacity-80' : 'bg-yellow-400 hover:bg-yellow-300 active:translate-y-1'} text-xs sm:text-sm lg:text-xl font-black py-1.5 sm:py-2 lg:py-3 px-2.5 sm:px-4 lg:px-6 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] active:shadow-none flex items-center gap-1 transition-all`}
          >
            💡 Gợi ý {hintsLeft > 0 && `(${hintsLeft})`}
          </button>
        </div>
      </div>

      {/* Khung vẽ */}
      <div className="flex-1 bg-white rounded-xl lg:rounded-[2rem] border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] lg:shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] relative flex flex-col items-center justify-center overflow-hidden touch-none">

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

        {/* 6. ĐÃ SỬA: Ẩn các công cụ vẽ khi đã đoán trúng */}
        {!isCorrect && (
          <>
            <div className="absolute top-3 left-3 lg:top-6 lg:left-6 flex flex-col gap-2 lg:gap-3 z-10">
              <button
                onClick={() => setActiveTool('brush')}
                className={`w-10 h-10 lg:w-14 lg:h-14 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-lg lg:text-2xl transition-all ${activeTool === 'brush' ? 'bg-cyan-300 scale-110 shadow-none translate-y-1' : 'bg-white hover:bg-gray-100 active:translate-y-1 active:shadow-none'
                  }`}
                title="Dùng cọ vẽ"
              >
                🖌️
              </button>
              <button
                onClick={() => setActiveTool('eraser')}
                className={`w-10 h-10 lg:w-14 lg:h-14 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-lg lg:text-2xl transition-all ${activeTool === 'eraser' ? 'bg-pink-300 scale-110 shadow-none translate-y-1' : 'bg-white hover:bg-gray-100 active:translate-y-1 active:shadow-none'
                  }`}
                title="Dùng cục tẩy"
              >
                🧽
              </button>
            </div>

            <button
              onClick={handleClearCanvas}
              className="absolute bottom-3 right-3 lg:bottom-6 lg:right-6 w-10 h-10 lg:w-14 lg:h-14 bg-red-400 hover:bg-red-300 text-white rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-lg lg:text-2xl active:translate-y-1 active:shadow-none transition-all z-10"
              title="Xóa hình vẽ"
            >
              🗑️
            </button>
          </>
        )}

        {hintStatus !== 'IDLE' && (
          <div
            className={`absolute top-3 right-3 z-20 transition-all duration-500 ease-in-out ${hintStatus === 'SHOWING'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-12 pointer-events-none'
              }`}
          >
            <div className="bg-white border-4 border-gray-800 rounded-xl p-3 lg:p-6 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center animate-float">
              {/* @ts-ignore */}
              <img
                src={REAL_IMAGES[currentWord?.word]}
                alt={currentWord?.word}
                className="w-24 h-24 lg:w-40 lg:h-40 object-cover rounded-lg"
              />
              <span className="font-black text-gray-700 text-xs lg:text-xl uppercase mt-2">{currentWord?.word}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center items-end gap-2 lg:gap-6 mt-3 lg:mt-6 h-14 sm:h-18 lg:h-24 shrink-0">
        <div className={`text-3xl sm:text-5xl lg:text-7xl pb-1 ${isCorrect ? 'animate-bounce' : 'animate-pulse'}`}>🤖</div>

        {/* ĐÃ SỬA: Nới rộng khung (max-w-md lg:max-w-xl) và thay truncate bằng break-words */}
        <div className={`${isCorrect ? 'bg-green-500' : 'bg-blue-500'} text-white font-bold text-xs sm:text-lg lg:text-2xl px-4 lg:px-8 py-2 lg:py-4 rounded-2xl rounded-tl-none border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] mb-1 w-full max-w-md lg:max-w-xl text-center break-words transition-colors`}>
          {aiGuess}
        </div>
      </div>
    </div>
  );
}

// --- SCREEN 4: SUMMARY SCREEN ---
function SummaryScreen({ setScreen, setSelectedDrawing, gameDrawings }: any) {
  const [sharePopup, setSharePopup] = useState(false);

  const handleShare = (e: any) => {
    e.stopPropagation();
    setSharePopup(true);
  };

  return (
    <div className="h-full w-full bg-sky-200 p-4 lg:p-8 flex flex-col relative overflow-y-auto">
      <div className="flex justify-between items-center mb-4 lg:mb-6 shrink-0 gap-4">
        <button onClick={() => setScreen('home')} className="w-9 h-9 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full text-base lg:text-xl font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0">⬅</button>
        <h1 className="flex-1 text-xl sm:text-2xl lg:text-4xl font-black text-gray-800 uppercase tracking-wide text-center truncate">Tóm tắt thư viện</h1>
        <div className="w-9 lg:w-12 shrink-0"></div>
      </div>

      {/* ĐÃ SỬA LỖI FONT CHỮ: Thay WebkitTextStroke bằng textShadow */}
      <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-center mb-4 lg:mb-8 text-white uppercase tracking-wider"
        style={{ textShadow: '2px 2px 0px #1f2937, -1.5px -1.5px 0 #1f2937, 1.5px -1.5px 0 #1f2937, -1.5px 1.5px 0 #1f2937, 1.5px 1.5px 0 #1f2937' }}>
        Nghệ sĩ tuyệt vời!
      </h2>

      {/* ĐÃ THÊM auto-rows-max VÀO GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-6 flex-1 px-1 lg:px-4 pb-6 auto-rows-max">
        {gameDrawings.map((item: any) => (
          <div key={item.id} className="bg-white rounded-2xl lg:rounded-3xl border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] p-2.5 lg:p-4 flex flex-col hover:-translate-y-0.5 transition-transform">

            {/* ĐÃ SỬA KÍCH THƯỚC Ô BẰNG NHAU: Thay flex-1 min-h-... bằng w-full aspect-square */}
            <div
              className="w-full aspect-square border-4 border-gray-200 rounded-xl lg:rounded-2xl flex items-center justify-center text-4xl sm:text-5xl lg:text-7xl cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden"
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

            <div className="mt-2 text-center">
              <span className="font-bold text-xs sm:text-sm lg:text-lg truncate block">{item.word} của bạn</span>

              {/* ĐOẠN CODE MỚI: HIỂN THỊ TRẠNG THÁI */}
              {item.isWin ? (
                <span className="text-green-500 font-black text-[10px] sm:text-xs uppercase block mt-1">✅ Vẽ chính xác</span>
              ) : (
                <span className="text-red-500 font-black text-[10px] sm:text-xs uppercase block mt-1">❌ Chưa chính xác</span>
              )}

              <button
                onClick={handleShare}
                className="mt-1.5 bg-yellow-400 hover:bg-yellow-300 text-[10px] sm:text-xs lg:text-sm font-black py-1 lg:py-2 px-3 lg:px-6 rounded-full border-2 border-gray-800 mx-auto block transition-transform active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] uppercase"
              >
                Chia sẻ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Share Popup Content */}
      {sharePopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border-4 border-gray-800 rounded-2xl p-6 lg:p-8 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] text-center flex flex-col items-center max-w-xs sm:max-w-md transform scale-100 transition-transform animate-bounce" style={{ animationIterationCount: 1 }}>
            <span className="text-4xl lg:text-6xl mb-2 lg:mb-4">🌟</span>
            <h3 className="text-xl lg:text-3xl font-black text-blue-500 mb-1 lg:mb-2 leading-tight">Bé vẽ rất đẹp!</h3>
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

// --- SCREEN 5: DETAIL SCREEN ---
function DetailScreen({ setScreen, drawing }: any) {
  const [relatedDrawings, setRelatedDrawings] = useState<any[]>([]);

  // 1. STATE THẢ TIM: Trí nhớ lưu trữ các ảnh đã thả tim (Đồng bộ với Cộng đồng)
  const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Đọc trí nhớ từ trình duyệt ngay khi mở trang
    const savedLikes = JSON.parse(localStorage.getItem('artie_liked_drawings') || '{}');
    setLikedItems(savedLikes);

    const fetchRelated = async () => {
      if (!drawing?.label) return;
      const { data } = await supabase
        .from('quickdraw_library')
        .select('*')
        .eq('label', drawing.label)
        .neq('id', drawing.id || 0)
        .limit(6);
      if (data) setRelatedDrawings(data);
    };
    fetchRelated();
  }, [drawing]);

  // 2. HÀM XỬ LÝ THẢ TIM
  const handleLike = async (e: any, id: number, currentLikes: number) => {
    e.stopPropagation();

    const isCurrentlyLiked = likedItems[id];
    const newLikeCount = isCurrentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    // Cập nhật giao diện lập tức
    setRelatedDrawings(prev =>
      prev.map(item => item.id === id ? { ...item, like_count: newLikeCount } : item)
    );

    // Cập nhật Local Storage
    const updatedLikes = { ...likedItems, [id]: !isCurrentlyLiked };
    setLikedItems(updatedLikes);
    localStorage.setItem('artie_liked_drawings', JSON.stringify(updatedLikes));

    // Cập nhật Supabase
    await supabase
      .from('quickdraw_library')
      .update({ like_count: newLikeCount })
      .eq('id', id);
  };

  return (
    <div className="h-full w-full bg-cyan-100 p-3 sm:p-5 lg:p-8 flex flex-col relative overflow-y-auto">
      {/* HEADER & NÚT BACK */}
      <div className="flex items-center mb-3 lg:mb-6 shrink-0 gap-4">
        <button
          onClick={() => setScreen('summary')}
          className="w-9 h-9 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-base lg:text-xl hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0"
        >
          ⬅
        </button>
        <h1 className="flex-1 text-center text-base sm:text-xl lg:text-3xl font-black uppercase text-gray-800 truncate">Chi tiết tác phẩm</h1>
        <div className="w-9 lg:w-12 shrink-0"></div>
      </div>

      {/* KHUNG ẢNH CHÍNH (CỦA NGƯỜI CHƠI) */}
      <div className="flex-1 bg-white rounded-2xl lg:rounded-[3rem] border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] lg:shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] p-4 lg:p-8 flex flex-col items-center justify-center relative mb-4 lg:mb-6 min-h-[200px]">
        <div className="w-full max-w-[300px] aspect-square lg:max-w-[500px] relative pointer-events-none">
          {drawing.drawingData && drawing.drawingData.length > 0 ? (
            <MiniCanvas drawingData={drawing.drawingData} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[100px] lg:text-[200px]">{drawing.emoji}</div>
          )}
        </div>
      </div>

      {/* BẢN VẼ CỦA CÁC BẠN KHÁC */}
      <div className="bg-white rounded-xl lg:rounded-[2rem] border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] p-3 lg:p-4 shrink-0">
        <h3 className="font-black text-center mb-3 uppercase text-gray-700 text-[11px] lg:text-base">Bản vẽ của các bạn khác</h3>

        {relatedDrawings.length === 0 ? (
          <p className="text-center text-gray-400 font-bold text-sm mb-2">Chưa có ai vẽ hình này!</p>
        ) : (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-1">
            {relatedDrawings.map(comm => (
              <div
                key={comm.id}
                // CHỈNH SỬA CSS TẠI ĐÂY: Thêm shrink-0 và chốt cứng kích thước
                className="relative shrink-0 w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] bg-white rounded-xl border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] p-1.5 flex flex-col items-center overflow-hidden"
              >
                {/* NÚT THẢ TIM (Góc trên phải) */}
                <button
                  onClick={(e) => handleLike(e, comm.id, comm.like_count || 0)}
                  className={`absolute top-1 right-1 sm:top-1.5 sm:right-1.5 z-10 text-sm sm:text-base hover:scale-110 active:scale-90 transition-transform ${likedItems[comm.id] ? 'text-red-500' : 'text-gray-300 hover:text-red-300'}`}
                >
                  {likedItems[comm.id] ? '❤️' : '🤍'}
                </button>

                {/* KHUNG VẼ (Dịch xuống một chút để không đè lên nút tim) */}
                <div className="w-full h-full relative mt-2 sm:mt-3 pointer-events-none">
                  <MiniCanvas drawingData={comm.drawing} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENT VẼ LẠI HÌNH TỪ JSON (TỰ ĐỘNG CĂN GIỮA) ---
function MiniCanvas({ drawingData }: { drawingData: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Lấy kích thước của khung thẻ HTML chứa nó
    const width = canvas.parentElement?.clientWidth || 200;
    const height = canvas.parentElement?.clientHeight || 200;
    canvas.width = width;
    canvas.height = height;

    // Reset lại nền canvas
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let strokes = [];
    try {
      strokes = typeof drawingData === 'string' ? JSON.parse(drawingData) : drawingData;
    } catch (e) {
      return;
    }

    if (!strokes || strokes.length === 0) return;

    // BƯỚC 1: TÌM HỘP GIỚI HẠN (BOUNDING BOX) CỦA BỨC VẼ
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    strokes.forEach((stroke: any) => {
      const xCoords = stroke[0];
      const yCoords = stroke[1];
      xCoords.forEach((x: number) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); });
      yCoords.forEach((y: number) => { minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    });

    // Kích thước thực tế của bức tranh
    const drawWidth = maxX - minX;
    const drawHeight = maxY - minY;

    // BƯỚC 2: TÍNH TOÁN TỶ LỆ THU NHỎ & ĐỘ DỊCH CHUYỂN (Để căn giữa)
    const padding = 15; // Lề an toàn để hình không chạm sát viền
    const scaleX = (width - padding * 2) / (drawWidth || 1);
    const scaleY = (height - padding * 2) / (drawHeight || 1);
    const scale = Math.min(scaleX, scaleY); // Lấy tỷ lệ nhỏ nhất để không bị méo hình

    // Tính toán tọa độ bù trừ để đẩy bức tranh ra chính giữa
    const offsetX = (width - drawWidth * scale) / 2 - minX * scale;
    const offsetY = (height - drawHeight * scale) / 2 - minY * scale;

    // BƯỚC 3: TIẾN HÀNH VẼ
    strokes.forEach((stroke: any) => {
      const xCoords = stroke[0];
      const yCoords = stroke[1];

      if (xCoords.length > 0) {
        ctx.beginPath();
        // Áp dụng tỷ lệ và độ dịch chuyển vào từng điểm ảnh
        ctx.moveTo(xCoords[0] * scale + offsetX, yCoords[0] * scale + offsetY);
        for (let i = 1; i < xCoords.length; i++) {
          ctx.lineTo(xCoords[i] * scale + offsetX, yCoords[i] * scale + offsetY);
        }
        ctx.stroke();
      }
    });
  }, [drawingData]);

  return <canvas ref={canvasRef} className="w-full h-full bg-transparent" />;
}

// --- SCREEN 6: COMMUNITY SCREEN (ĐÃ TÍCH HỢP THẢ TIM BẰNG LOCAL STORAGE) ---
function CommunityScreen({ setScreen }: any) {
  const [communityDrawings, setCommunityDrawings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem('artie_liked_drawings') || '{}');
    setLikedItems(savedLikes);

    const fetchTopDrawings = async () => {
      try {
        const { data, error } = await supabase
          .from('quickdraw_library')
          .select('*')
          .gte('like_count', 1)
          .order('like_count', { ascending: false })
          .limit(20);

        if (error) throw error;
        if (data) setCommunityDrawings(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu cộng đồng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDrawings();
  }, []);

  const handleLike = async (e: any, id: number, currentLikes: number) => {
    e.stopPropagation();
    const isCurrentlyLiked = likedItems[id];
    const newLikeCount = isCurrentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    setCommunityDrawings(prev =>
      prev.map(item => item.id === id ? { ...item, like_count: newLikeCount } : item)
    );

    const updatedLikes = { ...likedItems, [id]: !isCurrentlyLiked };
    setLikedItems(updatedLikes);
    localStorage.setItem('artie_liked_drawings', JSON.stringify(updatedLikes));

    await supabase
      .from('quickdraw_library')
      .update({ like_count: newLikeCount })
      .eq('id', id);
  };

  return (
    // SỬA Ở ĐÂY: Đổi overflow-y-auto thành overflow-hidden để khóa cuộn toàn trang
    <div className="h-full w-full bg-sky-100 p-3 sm:p-5 lg:p-8 flex flex-col relative overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center mb-4 lg:mb-8 shrink-0 gap-4">
        <button onClick={() => setScreen('home')} className="w-9 h-9 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-base lg:text-xl hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0">⬅</button>
        <h1 className="flex-1 text-center text-lg sm:text-2xl lg:text-4xl font-black uppercase text-gray-800 truncate">Cộng đồng Artie</h1>
        <div className="w-9 lg:w-12 shrink-0"></div>
      </div>

      {/* KHU VỰC CHỨA TRANH */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center text-2xl font-bold text-gray-500">Đang tải tranh...</div>
      ) : communityDrawings.length === 0 ? (
        <div className="flex-1 flex justify-center items-center text-xl font-bold text-gray-500">Chưa có bức tranh nào được thả tim!</div>
      ) : (
        // SỬA Ở ĐÂY: Thêm thẻ div bọc ngoài Grid có flex-1, min-h-0 và overflow-y-auto để chỉ cuộn danh sách này
        <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-6 pb-6 pt-1">
            {communityDrawings.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-2xl lg:rounded-3xl border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] p-2.5 lg:p-4 flex flex-col hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <div className="flex-1 h-20 sm:h-28 lg:h-32 border-4 border-gray-200 rounded-xl lg:rounded-2xl flex items-center justify-center mb-2 bg-gray-50 overflow-hidden relative pointer-events-none">
                  {item.drawing ? <MiniCanvas drawingData={item.drawing} /> : <span className="text-4xl">{item.emoji}</span>}
                </div>

                <div className="flex justify-between items-end gap-1">
                  <div className="leading-tight flex-1 min-w-0">
                    <span className="font-black text-[10px] sm:text-xs lg:text-sm text-gray-600 block truncate">{item.word}</span>
                    <span className="font-bold text-[10px] sm:text-xs lg:text-sm text-gray-400 block truncate">
                      {new Date(item.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleLike(e, item.id, item.like_count)}
                    className={`text-sm sm:text-base lg:text-lg flex flex-col items-center hover:scale-110 active:scale-90 transition-all shrink-0 font-bold ${likedItems[item.id] ? 'text-red-500' : 'text-gray-300 hover:text-red-300'}`}
                  >
                    {likedItems[item.id] ? '❤️' : '🤍'}
                    <span className={`text-[10px] lg:text-xs ${likedItems[item.id] ? 'text-red-500' : 'text-gray-400'}`}>
                      {item.like_count}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POPUP XEM ẢNH CHI TIẾT (Lúc này Popup đã được giải phóng khỏi khung cuộn) */}
      {selectedItem && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white border-[6px] border-gray-800 rounded-3xl p-4 lg:p-8 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-4 -right-4 bg-red-400 text-white border-4 border-gray-800 rounded-full w-10 h-10 flex items-center justify-center font-black text-xl hover:bg-red-500 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] active:translate-y-1 active:shadow-none transition-all z-10"
            >
              X
            </button>

            <h2 className="text-2xl lg:text-3xl font-black text-gray-800 uppercase mb-4 text-center">
              {selectedItem.word}
            </h2>

            <div className="w-full aspect-square border-4 border-gray-200 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden mb-4 relative pointer-events-none">
              {selectedItem.drawing ? <MiniCanvas drawingData={selectedItem.drawing} /> : <span className="text-6xl">{selectedItem.emoji}</span>}
            </div>

            <div className="flex justify-between items-center w-full px-2">
              <span className="font-bold text-gray-500 text-sm lg:text-base">
                Ngày vẽ: {new Date(selectedItem.created_at).toLocaleDateString('vi-VN')}
              </span>

              <button
                onClick={(e) => handleLike(e, selectedItem.id, selectedItem.like_count)}
                className={`flex items-center gap-1.5 font-black text-xl hover:scale-110 active:scale-90 transition-transform ${likedItems[selectedItem.id] ? 'text-red-500' : 'text-gray-300'}`}
              >
                {likedItems[selectedItem.id] ? '❤️' : '🤍'} {selectedItem.like_count}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}