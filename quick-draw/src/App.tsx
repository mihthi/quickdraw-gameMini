import React, { useState, useEffect, useRef } from 'react';
//import img1 from "../assets/img1.jpg"; // Đã sửa đường dẫn chuẩn xác dựa trên cấu trúc thư mục của bạn
import { REAL_IMAGES } from './imageLibrary';

const img1 = "/assets/img1.jpg";
// --- MOCK DATA ---  
const MOCK_DRAWINGS = [
  { id: 1, word: 'Máy bay', user: 'Bạn', emoji: '✈️', shared: false },
  { id: 2, word: 'Quả táo', user: 'Bạn', emoji: '🍎', shared: true },
  { id: 3, word: 'Ngôi nhà', user: 'Bạn', emoji: '🏠', shared: false },
  { id: 4, word: 'Con mèo', user: 'Bạn', emoji: '🐱', shared: false },
  { id: 5, word: 'Mặt trời', user: 'Bạn', emoji: '☀️', shared: true },
  { id: 6, word: 'Cái xe', user: 'Bạn', emoji: '🚗', shared: false },
];

const COMMUNITY_DRAWINGS = [
  { id: 101, word: 'Quả táo', user: 'Minh', emoji: '🍎', likes: 12 },
  { id: 102, word: 'Quả táo', user: 'Lan', emoji: '🍏', likes: 5 },
  { id: 103, word: 'Quả táo', user: 'Khoa', emoji: '🍎', likes: 8 },
  { id: 104, word: 'Quả táo', user: 'Nhi', emoji: '🍏', likes: 20 },
];

// --- MAIN APP COMPONENT ---
export default function DrawingGameApp() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedDrawing, setSelectedDrawing] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);

  const handleStartGame = () => {
    setCurrentRound(0);
    setHintsLeft(3);
    setCurrentScreen('ready');
  };

  const handleNextRound = () => {
    if (currentRound < MOCK_DRAWINGS.length - 1) {
      setCurrentRound(prev => prev + 1);
      setCurrentScreen('ready');
    } else {
      setCurrentScreen('summary');
    }
  };

  const currentWordObj = MOCK_DRAWINGS[currentRound] || MOCK_DRAWINGS[0];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen setScreen={setCurrentScreen} onStart={handleStartGame} />;
      case 'ready': return <ReadyScreen setScreen={setCurrentScreen} currentWord={currentWordObj} />;
      case 'game': return <GameScreen setScreen={setCurrentScreen} currentWord={currentWordObj} onNextRound={handleNextRound} hintsLeft={hintsLeft} setHintsLeft={setHintsLeft} />;
      case 'summary': return <SummaryScreen setScreen={setCurrentScreen} setSelectedDrawing={setSelectedDrawing} />;
      case 'detail': return <DetailScreen setScreen={setCurrentScreen} drawing={selectedDrawing} />;
      case 'community': return <CommunityScreen setScreen={setCurrentScreen} />;
      default: return <HomeScreen setScreen={setCurrentScreen} onStart={handleStartGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 lg:p-6 font-sans text-gray-900 select-none">
      {/* TỐI ƯU RESPONSIVE KHUNG IPAD:
        - Mobile & iPad/Tablet (< 1024px): Chạy full màn hình (w-full h-[100dvh]) để tối đa diện tích trải nghiệm.
        - Laptop/Desktop (>= 1024px): Hiển thị khung viền giả lập iPad tỉ lệ 4:3 siêu đẹp (lg:aspect-[4/3] max-w-5xl).
      */}
      <div className="w-full h-[100dvh] lg:h-auto lg:aspect-[4/3] max-w-5xl bg-white lg:rounded-[3rem] lg:shadow-[12px_12px_0px_0px_rgba(31,41,55,1)] lg:border-[12px] border-gray-800 overflow-hidden relative flex flex-col">
        {renderScreen()}
      </div>
    </div>
  );
}

// --- SCREEN 1: HOME SCREEN ---
function HomeScreen({ setScreen, onStart }: any) {
  return (
    <div
      className="h-full w-full relative flex flex-col items-center justify-between py-10 px-4 lg:py-12 lg:px-8 bg-sky-200"
      style={{
        backgroundImage: `url(${img1})`,
        backgroundSize: '100% 100%', // Đảm bảo ảnh kéo giãn khít hoàn toàn viền khung ở mọi tỷ lệ màn hình
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>

      {/* Tiêu đề tự động co giãn theo màn hình (text-3xl -> text-7xl) */}
      <div className="z-10 mt-12 lg:mt-8 relative px-4 text-center transform scale-90 sm:scale-100 transition-transform">
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white uppercase tracking-wider"
          style={{ WebkitTextStroke: '3px #1f2937', textShadow: '4px 4px 0px #1f2937' }}>
          Cuộc Phiêu Lưu
        </h1>
        <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-yellow-300 uppercase tracking-wider mt-2"
          style={{ WebkitTextStroke: '3px #1f2937', textShadow: '4px 4px 0px #1f2937' }}>
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

      {/* Khu vực nút bấm: Dọc trên Điện thoại, Ngang trên Tablet/Laptop */}
      <div className="z-10 flex flex-col sm:flex-row gap-3 lg:gap-6 mb-6 lg:mb-8 mt-auto relative w-full sm:w-auto px-6 sm:px-0">
        <button
          onClick={onStart}
          className="bg-cyan-300 hover:bg-cyan-200 text-lg sm:text-xl lg:text-3xl font-black py-3.5 px-6 lg:px-10 rounded-full border-4 border-gray-800 shadow-[5px_5px_0px_0px_rgba(31,41,55,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          ✏️ Cùng Vẽ Nào!
        </button>

        <button
          onClick={() => setScreen('community')}
          className="bg-yellow-400 hover:bg-yellow-300 text-base sm:text-lg lg:text-2xl font-black py-3.5 px-6 lg:px-8 rounded-full border-4 border-gray-800 shadow-[5px_5px_0px_0px_rgba(31,41,55,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 w-full sm:w-auto"
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
      <div className="bg-white px-6 py-8 sm:px-12 sm:py-10 lg:px-16 lg:py-12 rounded-3xl lg:rounded-[3rem] border-4 lg:border-8 border-gray-800 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] lg:shadow-[12px_12px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center transform -rotate-1 w-full max-w-md text-center">
        <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-3 lg:mb-6 text-gray-700">Từ khóa của bé là:</h2>
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-6 lg:mb-12 text-blue-500 uppercase truncate w-full px-2"
          style={{ WebkitTextStroke: '2px #1f2937', textShadow: '4px 4px 0px #1f2937' }}>
          {currentWord?.word}
        </h1>
        <button
          onClick={() => setScreen('game')}
          className="bg-yellow-400 text-gray-900 text-xl sm:text-2xl lg:text-4xl font-black py-3 px-8 sm:py-4 sm:px-12 lg:py-5 lg:px-16 rounded-full border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] lg:shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] active:translate-y-1 active:shadow-none transition-all hover:bg-yellow-300 animate-bounce w-full sm:w-auto"
        >
          SẴN SÀNG!
        </button>
      </div>
    </div>
  );
}

// --- SCREEN 3: GAMEPLAY SCREEN ---
// --- SCREEN 3: GAMEPLAY SCREEN ---
function GameScreen({ setScreen, currentWord, onNextRound, hintsLeft, setHintsLeft }: any) {
  const [aiGuess, setAiGuess] = useState("AI đang xem bé vẽ...");

  // CẬP NHẬT: Thay đổi showHint thành hintStatus với 3 trạng thái
  const [hintStatus, setHintStatus] = useState<'IDLE' | 'SHOWING' | 'HIDING'>('IDLE');

  const [timeLeft, setTimeLeft] = useState(20);

  // THÊM MỚI: State lưu công cụ đang sử dụng (Mặc định là Cọ)
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser'>('brush');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleShowHint = () => {
    if (hintsLeft > 0 && hintStatus === 'IDLE') {
      setHintsLeft((prev: number) => prev - 1);
      setHintStatus('SHOWING'); // Bật popup lên

      setTimeout(() => setHintStatus('HIDING'), 3000);

      setTimeout(() => setHintStatus('IDLE'), 3500);
    }
  };

  useEffect(() => {
    setTimeLeft(20);
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentWord]);

  useEffect(() => {
    if (timeLeft === 0) {
      onNextRound();
    }
  }, [timeLeft, onNextRound]);

  useEffect(() => {
    const guesses = ["Hình như là đường thẳng...", "Có phải là hình tròn?", `Đó là ${currentWord?.word?.toUpperCase()}!`];
    let i = 0;
    const interval = setInterval(() => {
      setAiGuess(guesses[i]);
      i++;
      if (i >= guesses.length) {
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentWord]);

  // TỐI ƯU CANVAS: Lắng nghe sự kiện đổi kích thước cửa sổ/xoay màn hình
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    updateCanvasSize(); // Chạy ngay lần đầu tiên
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [currentWord]);

  // THÊM MỚI: Hàm xóa toàn bộ canvas
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: any) => {
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
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);

    // CẬP NHẬT: Xử lý công cụ Cọ và Tẩy
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20; // Nét tẩy to hơn
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 6;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="h-full w-full bg-emerald-200 p-3 sm:p-5 lg:p-8 flex flex-col relative">
      {/* Header dàn hàng ngang */}
      <div className="flex justify-between items-center mb-3 lg:mb-6 z-10 gap-2 w-full">
        <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
          <button onClick={() => setScreen('home')} className="w-9 h-9 sm:w-11 sm:h-11 lg:w-14 lg:h-14 bg-white border-4 border-gray-800 rounded-full flex justify-center items-center text-sm sm:text-base lg:text-2xl font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] hover:bg-gray-100 active:translate-y-1 active:shadow-none shrink-0">⬅</button>
          <h2 className="text-sm sm:text-lg lg:text-4xl font-black bg-white px-3 sm:px-5 lg:px-8 py-1.5 sm:py-2 lg:py-3 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] text-blue-600 truncate">
            Vẽ: {currentWord?.word?.toUpperCase()}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="bg-white px-2.5 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] text-xs sm:text-base lg:text-2xl font-black flex items-center gap-0.5">
            ⏱️{timeLeft}s
          </div>
          <button
            onClick={handleShowHint}
            // Chỉ được bấm khi còn số lần trợ giúp và nút đang rảnh (IDLE)
            disabled={hintsLeft === 0 || hintStatus !== 'IDLE'}
            className={`${hintsLeft === 0 || hintStatus !== 'IDLE' ? 'bg-gray-400 opacity-80' : 'bg-yellow-400 hover:bg-yellow-300 active:translate-y-1'} text-xs sm:text-sm lg:text-xl font-black py-1.5 sm:py-2 lg:py-3 px-2.5 sm:px-4 lg:px-6 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] active:shadow-none flex items-center gap-1 transition-all`}
          >
            💡 Gợi ý {hintsLeft > 0 && `(${hintsLeft})`}
          </button>
        </div>
      </div>

      {/* Khung vẽ */}
      <div className="flex-1 bg-white rounded-xl lg:rounded-[2rem] border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] lg:shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] relative flex flex-col items-center justify-center overflow-hidden touch-none">

        {/* CẬP NHẬT: Thêm logic đổi con trỏ chuột khi dùng tẩy vào class của canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`absolute inset-0 w-full h-full ${activeTool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
        />

        {/* THÊM MỚI: BỘ CÔNG CỤ CỌ & TẨY Ở GÓC TRÊN TRÁI */}
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

        {/* THÊM MỚI: NÚT XÓA Ở GÓC DƯỚI PHẢI */}
        <button
          onClick={handleClearCanvas}
          className="absolute bottom-3 right-3 lg:bottom-6 lg:right-6 w-10 h-10 lg:w-14 lg:h-14 bg-red-400 hover:bg-red-300 text-white rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-lg lg:text-2xl active:translate-y-1 active:shadow-none transition-all z-10"
          title="Xóa hình vẽ"
        >
          🗑️
        </button>

        {/* CẬP NHẬT: Popup Hint với hiệu ứng trượt và mờ dần */}
        {hintStatus !== 'IDLE' && (
          <div
            className={`absolute top-3 right-3 z-20 transition-all duration-500 ease-in-out ${hintStatus === 'SHOWING'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-12 pointer-events-none'
              }`}
          >
            <div className="bg-white border-4 border-gray-800 rounded-xl p-3 lg:p-6 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center animate-float">
              {/* CHỖ NÀY LÀ NƠI BẠN SẼ THAY THẾ BẰNG ẢNH THỰC TẾ */}
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

      {/* Bong bóng chat AI */}
      <div className="flex justify-center items-end gap-2 lg:gap-6 mt-3 lg:mt-6 h-14 sm:h-18 lg:h-24 shrink-0">
        <div className="text-3xl sm:text-5xl lg:text-7xl animate-pulse pb-1">🤖</div>
        <div className="bg-blue-500 text-white font-bold text-xs sm:text-lg lg:text-2xl px-4 lg:px-8 py-2 lg:py-4 rounded-2xl rounded-tl-none border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] mb-1 w-full max-w-xs sm:max-w-sm text-center truncate">
          {aiGuess}
        </div>
      </div>
    </div>
  );
}

// --- SCREEN 4: SUMMARY SCREEN ---
function SummaryScreen({ setScreen, setSelectedDrawing }: any) {
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

      <h2 className="text-xl sm:text-3xl lg:text-5xl font-black text-center mb-4 lg:mb-8 text-white uppercase drop-shadow-[3px_3px_0px_rgba(31,41,55,1)]" style={{ WebkitTextStroke: '1.5px #1f2937' }}>
        Nghệ sĩ tuyệt vời!
      </h2>

      {/* Grid tự động chia 2 cột trên điện thoại và 3 cột từ tablet trở lên */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-6 flex-1 px-1 lg:px-4 pb-6">
        {MOCK_DRAWINGS.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl lg:rounded-3xl border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] p-2.5 lg:p-4 flex flex-col hover:-translate-y-0.5 transition-transform">
            <div
              className="flex-1 min-h-[90px] sm:min-h-[120px] lg:min-h-[140px] border-4 border-gray-200 rounded-xl lg:rounded-2xl flex items-center justify-center text-4xl sm:text-5xl lg:text-7xl cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => { setSelectedDrawing(item); setScreen('detail'); }}
            >
              {item.emoji}
            </div>
            <div className="mt-2 text-center">
              <span className="font-bold text-xs sm:text-sm lg:text-lg truncate block">{item.word} của bạn</span>
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
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMsg, setShowShareMsg] = useState(false);
  const [showPhotobooth, setShowPhotobooth] = useState(false);
  const [likedCommunityItems, setLikedCommunityItems] = useState<Record<number, boolean>>({});

  if (!drawing) return null;

  const handleShare = () => {
    setShowPhotobooth(true);
  };

  const toggleCommunityLike = (e: any, id: number) => {
    e.stopPropagation();
    setLikedCommunityItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-full w-full bg-cyan-100 p-3 sm:p-5 lg:p-8 flex flex-col relative overflow-y-auto">
      <div className="flex items-center mb-3 lg:mb-6 shrink-0 gap-4">
        <button onClick={() => setScreen('summary')} className="w-9 h-9 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-base lg:text-xl hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0">⬅</button>
        <h1 className="flex-1 text-center text-base sm:text-xl lg:text-3xl font-black uppercase text-gray-800 truncate">Chi tiết tác phẩm</h1>
        <div className="w-9 lg:w-12 shrink-0"></div>
      </div>

      <div className="flex-1 bg-white rounded-2xl lg:rounded-[3rem] border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] lg:shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] p-4 lg:p-8 flex flex-col items-center justify-center relative mb-4 lg:mb-6 min-h-[200px]">
        <div className="w-full flex flex-row justify-between items-center gap-2 mb-3 lg:mb-6 absolute top-4 px-4 lg:px-8">
          <div className="flex items-center gap-1.5 lg:gap-3">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-300 rounded-full border-4 border-gray-800 flex items-center justify-center text-base lg:text-2xl">😊</div>
            <span className="font-bold text-sm lg:text-xl truncate max-w-[120px] sm:max-w-none">{drawing.word} của Bạn</span>
          </div>
          <div className="flex gap-2 relative">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`${isLiked ? 'bg-pink-400 text-white' : 'bg-sky-200'} font-bold px-2.5 py-1.5 lg:px-5 lg:py-2 text-xs lg:text-base rounded-full border-2 lg:border-4 border-gray-800 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] active:translate-y-0.5 transition-colors`}
            >
              {isLiked ? '❤️ Thích' : '🤍 Thích'}
            </button>
            <button
              onClick={handleShare}
              className="bg-green-300 hover:bg-green-400 font-bold px-2.5 py-1.5 lg:px-5 lg:py-2 text-xs lg:text-base rounded-full border-2 lg:border-4 border-gray-800 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] active:translate-y-0.5 transition-colors"
            >
              🔗 Gửi
            </button>
          </div>
        </div>

        <div className="text-[90px] sm:text-[140px] lg:text-[200px] hover:scale-105 transition-transform cursor-pointer mt-8">
          {drawing.emoji}
        </div>
      </div>

      {/* Slider ngang cho các bản vẽ khác dưới mobile */}
      <div className="bg-white rounded-xl lg:rounded-[2rem] border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] p-3 lg:p-4 shrink-0">
        <h3 className="font-black text-center mb-2 uppercase text-gray-700 text-[11px] lg:text-base">Bản vẽ của các bạn khác</h3>
        <div className="flex gap-3 overflow-x-auto pb-1.5">
          {COMMUNITY_DRAWINGS.map(comm => (
            <div key={comm.id} className="min-w-[85px] h-[85px] sm:min-w-[120px] sm:h-[120px] bg-sky-50 rounded-xl lg:rounded-2xl border-4 border-gray-800 flex flex-col items-center justify-center p-1.5 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] cursor-pointer hover:-translate-y-0.5 transition-transform relative">
              <button
                onClick={(e) => toggleCommunityLike(e, comm.id)}
                className="absolute top-1 right-1 text-sm sm:text-xl z-10 active:scale-90 transition-transform"
              >
                {likedCommunityItems[comm.id] ? '❤️' : '🤍'}
              </button>
              <span className="text-3xl sm:text-5xl mb-0.5 sm:mb-2">{comm.emoji}</span>
              <span className="text-[9px] sm:text-xs font-bold text-center leading-tight truncate w-full px-1">{comm.word} - {comm.user}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Photobooth Popup Content */}
      {showPhotobooth && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border-[6px] lg:border-[12px] border-yellow-300 rounded-2xl p-4 lg:p-6 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] lg:shadow-[12px_12px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center max-w-xs w-full transform scale-100 transition-transform animate-bounce relative" style={{ animationIterationCount: 1 }}>

            <div className="bg-sky-100 border-4 border-gray-800 rounded-xl w-full aspect-square flex flex-col items-center justify-center mb-4 overflow-hidden relative shadow-inner">
              <div className="text-[90px] lg:text-[150px] transform hover:scale-105 transition-transform">
                {drawing.emoji}
              </div>
              <span className="absolute top-2 left-2 text-xl lg:text-3xl">✨</span>
              <span className="absolute bottom-2 right-2 text-xl lg:text-3xl">🎉</span>
            </div>

            <div className="text-center w-full">
              <h3 className="text-xl lg:text-3xl font-black text-gray-800 uppercase mb-0.5" style={{ WebkitTextStroke: '1px white' }}>{drawing.word}</h3>
              <p className="font-bold text-gray-500 mb-4 text-xs lg:text-lg">Tác phẩm của Bạn</p>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  setShowShareMsg(true);
                  setTimeout(() => setShowShareMsg(false), 2000);
                }}
                className="flex-1 bg-green-400 hover:bg-green-300 text-sm lg:text-lg font-black py-2 lg:py-3 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] active:translate-y-0.5 transition-all"
              >
                Tải Xuống 📥
              </button>
              <button
                onClick={() => setShowPhotobooth(false)}
                className="bg-red-400 text-white hover:bg-red-300 text-sm lg:text-lg font-black py-2 px-4 lg:py-3 lg:px-6 rounded-full border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] active:translate-y-0.5 transition-all"
              >
                Đóng
              </button>
            </div>

            {showShareMsg && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white border-4 border-gray-800 rounded-xl px-3 py-1.5 font-bold shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] animate-bounce text-green-600 z-10 text-xs sm:text-base whitespace-nowrap">
                Đã tải xuống thành công! 🎉
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- SCREEN 6: COMMUNITY SCREEN ---
function CommunityScreen({ setScreen }: any) {
  const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});

  const toggleLike = (idx: number) => {
    setLikedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="h-full w-full bg-sky-100 p-3 sm:p-5 lg:p-8 flex flex-col relative overflow-y-auto">
      <div className="flex items-center mb-4 lg:mb-8 shrink-0 gap-4">
        <button onClick={() => setScreen('home')} className="w-9 h-9 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-base lg:text-xl hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0">⬅</button>
        <h1 className="flex-1 text-center text-lg sm:text-2xl lg:text-4xl font-black uppercase text-gray-800 truncate">Cộng đồng Artie</h1>
        <div className="w-9 lg:w-12 shrink-0"></div>
      </div>

      {/* Grid tự động chia: 2 cột trên Mobile nhỏ, 3 cột trên Mobile lớn, 4-5 cột trên Laptop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-6 pb-6 px-1 flex-1">
        {[...COMMUNITY_DRAWINGS, ...COMMUNITY_DRAWINGS].map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl lg:rounded-3xl border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] p-2.5 lg:p-4 flex flex-col hover:-translate-y-0.5 transition-transform">
            <div className="flex-1 h-20 sm:h-28 lg:h-32 border-4 border-gray-200 rounded-xl lg:rounded-2xl flex items-center justify-center text-4xl sm:text-5xl lg:text-6xl mb-2 bg-gray-50 cursor-pointer">
              {item.emoji}
            </div>
            <div className="flex justify-between items-end gap-1">
              <div className="leading-tight flex-1 min-w-0">
                <span className="font-black text-[10px] sm:text-xs lg:text-sm text-gray-600 block truncate">{item.word}</span>
                <span className="font-bold text-[10px] sm:text-xs lg:text-sm text-gray-900 block truncate">của {item.user}</span>
              </div>
              <button
                onClick={() => toggleLike(idx)}
                className={`text-xl sm:text-2xl lg:text-3xl hover:scale-110 active:scale-90 transition-all shrink-0 ${likedItems[idx] ? 'text-red-500 drop-shadow-[0_1.5px_0_rgba(0,0,0,1)]' : 'grayscale opacity-40'}`}
              >
                ❤️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}