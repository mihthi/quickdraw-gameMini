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
      <div className="w-full h-[100dvh] lg:h-[82vh] lg:w-auto lg:aspect-[4/3] bg-white lg:rounded-[3rem] lg:shadow-[12px_12px_0px_0px_rgba(31,41,55,1)] lg:border-[12px] border-gray-800 overflow-hidden relative flex flex-col">
        {renderScreen()}
      </div>
    </div>
  );
}


// --- SCREEN 1: HOME SCREEN  ---
function HomeScreen({ setScreen, onStart, isStarting }: any) {
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

      {/* Header text group - Đã thu nhỏ chữ và margin */}
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

      {/* Main robot image area - Đã thu nhỏ robot để nhường chỗ cho nút */}
      <div className="z-10 flex flex-1 items-center justify-center w-full relative">
        <div
          className="text-[70px] sm:text-[850px] lg:text-[100px] animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          🤖
        </div>
      </div>

      {/* Footer buttons row - Cân đối lại kích thước nút */}
      <div className="z-10 flex flex-col sm:flex-row justify-center items-center gap-3 lg:gap-5 mb-8 lg:mb-14 mt-auto relative w-full px-4">
        <button
          onClick={onStart}
          disabled={isStarting}
          className={`${isStarting ? 'bg-gray-400' : 'bg-cyan-300 hover:bg-cyan-200'} text-sm sm:text-base lg:text-lg font-black py-2.5 px-4 lg:py-3 lg:px-6 rounded-full border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 w-full max-w-[200px] lg:max-w-[220px] shrink-0`}
        >
          {/* ĐÃ SỬA: Bọc icon vào thẻ span có text-xs/text-sm để thu nhỏ */}
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
          {/* ĐÃ SỬA: Bọc icon vào thẻ span có text-xs/text-sm để thu nhỏ */}
          <span className="text-xs sm:text-sm">🌍</span> Cộng Đồng
        </button>
      </div>
    </div >
  );
}

// --- SCREEN 2: READY SCREEN ---
function ReadyScreen({ setScreen, currentWord }: any) {
  return (
    <div className="h-full w-full bg-sky-300 flex items-center justify-center relative p-4">
      <div className="bg-white px-6 py-8 sm:px-12 rounded-3xl border-4 lg:border-8 border-gray-800 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center transform -rotate-1 w-full max-w-lg text-center">
        <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-3 text-gray-700">Từ khóa của bé là:</h2>

        {/* BỎ TRUNCATE, THÊM BREAK-WORDS ĐỂ CHỮ XUỐNG DÒNG */}
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

// --- SCREEN 3: GAMEPLAY SCREEN ---
// --- SCREEN 3: GAMEPLAY SCREEN ---

function GameScreen({ setScreen, currentWord, onNextRound, hintsLeft, setHintsLeft, isAiReady }: any) {
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
      if (isDrawingRef.current && currentPathRef.current.x.length > 0) {
        const newStroke = [currentPathRef.current.x, currentPathRef.current.y];
        strokesRef.current = [...strokesRef.current, newStroke];
      }

      onNextRound(strokesRef.current, false);
    }
  }, [timeLeft])

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

    // ĐÃ SỬA: Ghi chép tức thời bằng Ref
    isDrawingRef.current = true;
    currentPathRef.current = { x: [x], y: [y] };
  };

  const draw = (e: any) => {
    // ĐÃ SỬA: Dùng isDrawingRef
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

      // ĐÃ SỬA: Đẩy tọa độ trực tiếp vào Ref không cần chờ React
      currentPathRef.current.x.push(x);
      currentPathRef.current.y.push(y);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    // ĐÃ SỬA: Đọc dữ liệu từ Ref
    if (isDrawingRef.current && currentPathRef.current.x.length > 0) {
      const newStroke = [currentPathRef.current.x, currentPathRef.current.y];
      strokesRef.current = [...strokesRef.current, newStroke];
      setStrokes(strokesRef.current);
    }

    // Reset ngay lập tức
    isDrawingRef.current = false;
    currentPathRef.current = { x: [], y: [] };

    setTimeout(() => {
      runAIPrediction();
    }, 50);
  };

 return (
    <div className="h-full w-full bg-emerald-200 p-2 sm:p-3 lg:p-4 flex flex-col relative">
      
      {/* HEADER: Thu nhỏ nút, chữ, padding và lề dưới */}
      <div className="flex justify-between items-center mb-1.5 lg:mb-3 z-10 gap-1.5 w-full shrink-0">
        <div className="flex items-center gap-1.5 lg:gap-2 flex-1 min-w-0">
          <button onClick={() => setScreen('home')} className="w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 bg-white border-2 sm:border-4 border-gray-800 rounded-full flex justify-center items-center text-xs sm:text-sm lg:text-lg font-bold shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] hover:bg-gray-100 active:translate-y-1 active:shadow-none shrink-0">⬅</button>
          <h2 className="text-xs sm:text-sm lg:text-lg font-black bg-white px-2 sm:px-3 lg:px-5 py-1 sm:py-1.5 rounded-full border-2 sm:border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] text-blue-600 truncate">
            Vẽ: {currentWord?.word?.toUpperCase()}
          </h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div className={`bg-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 rounded-full border-2 sm:border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] text-[10px] sm:text-xs lg:text-base font-black flex items-center gap-0.5 ${isCorrect ? 'text-green-500' : ''}`}>
            ⏱️{timeLeft}s
          </div>
          <button
            onClick={handleShowHint}
            disabled={hintsLeft === 0 || hintStatus !== 'IDLE' || isCorrect}
            className={`${hintsLeft === 0 || hintStatus !== 'IDLE' || isCorrect ? 'bg-gray-400 opacity-80' : 'bg-yellow-400 hover:bg-yellow-300 active:translate-y-1'} text-[10px] sm:text-xs lg:text-base font-black py-1 sm:py-1.5 px-2 sm:px-3 lg:px-4 rounded-full border-2 sm:border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] active:shadow-none flex items-center gap-1 transition-all`}
          >
            💡 Gợi ý {hintsLeft > 0 && `(${hintsLeft})`}
          </button>
        </div>
      </div>

      {/* KHUNG VẼ (CANVAS): Đã có min-h-0 và flex-1, khi Header/Footer nhỏ lại thì nó tự động bự ra */}
      <div className="flex-1 bg-white rounded-xl lg:rounded-[2rem] border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] lg:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] relative flex flex-col items-center justify-center overflow-hidden touch-none min-h-0">

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
            {/* CÔNG CỤ VẼ: Thu nhỏ icon Cọ và Tẩy bên trong canvas */}
            <div className="absolute top-2 left-2 lg:top-3 lg:left-3 flex flex-col gap-1.5 lg:gap-2 z-10">
              <button
                onClick={() => setActiveTool('brush')}
                className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 rounded-full border-2 sm:border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-sm lg:text-lg transition-all ${activeTool === 'brush' ? 'bg-cyan-300 scale-110 shadow-none translate-y-1' : 'bg-white hover:bg-gray-100 active:translate-y-1 active:shadow-none'}`}
                title="Dùng cọ vẽ"
              >
                🖌️
              </button>
              <button
                onClick={() => setActiveTool('eraser')}
                className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 rounded-full border-2 sm:border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-sm lg:text-lg transition-all ${activeTool === 'eraser' ? 'bg-pink-300 scale-110 shadow-none translate-y-1' : 'bg-white hover:bg-gray-100 active:translate-y-1 active:shadow-none'}`}
                title="Dùng cục tẩy"
              >
                🧽
              </button>
            </div>

            {/* NÚT THÙNG RÁC: Thu nhỏ */}
            <button
              onClick={handleClearCanvas}
              className="absolute bottom-2 right-2 lg:bottom-3 lg:right-3 w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 bg-red-400 hover:bg-red-300 text-white rounded-full border-2 sm:border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-sm lg:text-lg active:translate-y-1 active:shadow-none transition-all z-10"
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
            <div className="bg-white border-2 lg:border-4 border-gray-800 rounded-xl p-2 lg:p-3 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center animate-float">
              {/* @ts-ignore */}
              <img
                src={REAL_IMAGES[currentWord?.word]}
                alt={currentWord?.word}
                className="w-16 h-16 lg:w-24 lg:h-24 object-cover rounded-lg"
              />
              <span className="font-black text-gray-700 text-[10px] lg:text-sm uppercase mt-1">{currentWord?.word}</span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: Thu nhỏ robot và thanh chat AI */}
      <div className="flex justify-center items-center gap-2 mt-2 lg:mt-3 shrink-0">
        <div className={`text-2xl sm:text-3xl lg:text-4xl ${isCorrect ? 'animate-bounce' : 'animate-pulse'}`}>🤖</div>

        <div className={`${isCorrect ? 'bg-green-500' : 'bg-blue-500'} text-white font-bold text-[10px] sm:text-xs lg:text-base px-3 lg:px-5 py-1.5 lg:py-2.5 rounded-xl sm:rounded-2xl rounded-tl-none border-2 sm:border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] w-full max-w-xs sm:max-w-sm lg:max-w-md text-center break-words transition-colors`}>
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
    // ĐÃ SỬA: Đổi overflow-y-auto thành overflow-hidden, giảm padding tổng thể (p-3 lg:p-6)
    <div className="h-full w-full bg-sky-200 p-3 sm:p-4 lg:p-6 flex flex-col relative overflow-hidden">
      
      {/* HEADER: Giảm margin-bottom (mb) và thu nhỏ nút back */}
      <div className="flex justify-between items-center mb-2 lg:mb-4 shrink-0 gap-2">
        <button onClick={() => setScreen('home')} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full text-sm sm:text-base lg:text-xl font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0">⬅</button>
        <h1 className="flex-1 text-base sm:text-xl lg:text-2xl font-black text-gray-800 uppercase tracking-wide text-center truncate">Tóm tắt thư viện</h1>
        <div className="w-8 sm:w-10 lg:w-12 shrink-0"></div>
      </div>

      {/* SUBTITLE: Thu nhỏ size chữ và lề dưới */}
      <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-center mb-2 lg:mb-4 text-white uppercase tracking-wider shrink-0"
        style={{ textShadow: '2px 2px 0px #1f2937, -1.5px -1.5px 0 #1f2937, 1.5px -1.5px 0 #1f2937, -1.5px 1.5px 0 #1f2937, 1.5px 1.5px 0 #1f2937' }}>
        Nghệ sĩ tuyệt vời!
      </h2>

      {/* KHU VỰC THẺ: Xóa auto-rows-max, thêm min-h-0 để thẻ tự động thu nhỏ vừa với màn hình */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-5 flex-1 px-1 lg:px-2 pb-2 min-h-0">
        {gameDrawings.map((item: any) => (
          // CARD: Giảm padding bên trong thẻ
          <div key={item.id} className="bg-white rounded-xl lg:rounded-2xl border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] lg:shadow-[5px_5px_0px_0px_rgba(31,41,55,1)] p-1.5 sm:p-2 lg:p-3 flex flex-col hover:-translate-y-0.5 transition-transform overflow-hidden">

            {/* HÌNH VẼ: aspect-square giúp hình vuông, thu nhỏ border */}
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

            {/* THÔNG TIN VÀ NÚT BẤM: Tự động co giãn (flex-1) */}
            <div className="mt-1 sm:mt-2 text-center flex flex-col justify-between flex-1 min-h-0">
              <div>
                <span className="font-bold text-[10px] sm:text-[11px] lg:text-sm truncate block">{item.word}</span>
                {item.isWin ? (
                  <span className="text-green-500 font-black text-[9px] sm:text-[10px] lg:text-xs uppercase block mt-0.5 lg:mt-1">✅ Chính xác</span>
                ) : (
                  <span className="text-red-500 font-black text-[9px] sm:text-[10px] lg:text-xs uppercase block mt-0.5 lg:mt-1">❌ Sai rồi</span>
                )}
              </div>

              {/* Thu nhỏ nút bấm để vừa khít */}
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

      {/* Share Popup Content */}
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
        .limit(30); // ĐÃ SỬA: Lấy 30 ảnh thay vì 6 để có kho dữ liệu đem đi xáo trộn

      if (data) {
        // ĐÃ SỬA: Thuật toán xáo trộn mảng ngẫu nhiên
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        // Chỉ bốc đúng 6 ảnh đầu tiên sau khi đã trộn để hiển thị
        setRelatedDrawings(shuffled.slice(0, 6)); 
      }
    };
    fetchRelated();
  }, [drawing]);

  // 2. HÀM XỬ LÝ THẢ TIM (ĐÃ FIX LỖI MẤT TRÍ NHỚ)
  const handleLike = (e: any, id: number, currentLikes: number) => {
    e.stopPropagation();

    // Dùng functional update (prev) để luôn lấy dữ liệu mới nhất từ bộ nhớ, tránh ghi đè sai
    setLikedItems(prev => {
      const isCurrentlyLiked = prev[id];
      const newLikeCount = isCurrentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
      const updatedLikes = { ...prev, [id]: !isCurrentlyLiked };

      // Cập nhật Local Storage ngay lập tức
      localStorage.setItem('artie_liked_drawings', JSON.stringify(updatedLikes));

      // Cập nhật giao diện lập tức (không cần chờ server)
      setRelatedDrawings(prevDrawings =>
        prevDrawings.map(item => item.id === id ? { ...item, like_count: newLikeCount } : item)
      );

      // Cập nhật Supabase ngầm phía sau
      supabase
        .from('quickdraw_library')
        .update({ like_count: newLikeCount })
        .eq('id', id).then();

      return updatedLikes;
    });
  };

  return (
    <div className="h-full w-full bg-cyan-100 p-3 sm:p-4 lg:p-5 flex flex-col relative overflow-hidden">
      
      {/* HEADER & NÚT BACK */}
      <div className="flex items-center mb-2 lg:mb-4 shrink-0 gap-2">
        <button
          onClick={() => setScreen('summary')}
          className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-sm sm:text-base lg:text-xl hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0"
        >
          ⬅
        </button>
        <h1 className="flex-1 text-center text-base sm:text-lg lg:text-2xl font-black uppercase text-gray-800 truncate">Chi tiết tác phẩm</h1>
        <div className="w-8 sm:w-10 lg:w-12 shrink-0"></div>
      </div>

      {/* KHUNG ẢNH CHÍNH (CỦA NGƯỜI CHƠI) */}
      <div className="flex-1 min-h-0 bg-white rounded-xl lg:rounded-[2rem] border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] p-1 sm:p-2 flex flex-col items-center justify-center relative mb-2 lg:mb-3">
        <div className="h-full max-w-full aspect-square relative pointer-events-none flex items-center justify-center">
          {drawing.drawingData && drawing.drawingData.length > 0 ? (
            <MiniCanvas drawingData={drawing.drawingData} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[120px] lg:text-[180px]">{drawing.emoji}</div>
          )}
        </div>
      </div>

      {/* BẢN VẼ CỦA CÁC BẠN KHÁC */}
      <div className="bg-white rounded-xl lg:rounded-[1.2rem] border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] p-1.5 lg:p-2 shrink-0">
        <h3 className="font-black text-center mb-1 lg:mb-1.5 uppercase text-gray-700 text-[10px] sm:text-xs lg:text-sm">Bản vẽ của các bạn khác</h3>

        {relatedDrawings.length === 0 ? (
          <p className="text-center text-gray-400 font-bold text-xs sm:text-sm mb-1">Chưa có ai vẽ hình này!</p>
        ) : (
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 px-1">
            {relatedDrawings.map(comm => (
              <div
                key={comm.id}
                className="relative shrink-0 w-[50px] h-[50px] sm:w-[65px] sm:h-[65px] lg:w-[80px] lg:h-[80px] bg-white rounded-lg border-2 sm:border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] p-0.5 sm:p-1 flex flex-col items-center overflow-hidden"
              >
                {/* NÚT THẢ TIM */}
                <button
                  onClick={(e) => handleLike(e, comm.id, comm.like_count || 0)}
                  className={`absolute top-0 right-0 sm:top-0.5 sm:right-0.5 z-10 text-[9px] sm:text-[11px] lg:text-xs hover:scale-110 active:scale-90 transition-transform ${likedItems[comm.id] ? 'text-red-500' : 'text-gray-300 hover:text-red-300'}`}
                >
                  {likedItems[comm.id] ? '❤️' : '🤍'}
                </button>

                {/* KHUNG VẼ */}
                <div className="w-full h-full relative mt-1 pointer-events-none">
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

    const width = canvas.parentElement?.clientWidth || 200;
    const height = canvas.parentElement?.clientHeight || 200;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#1f2937';
    
    // 1. ĐÃ SỬA: Tự động cho nét vẽ mỏng lại nếu khung canvas quá nhỏ
    ctx.lineWidth = width < 100 ? 2 : 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let strokes = [];
    try {
      strokes = typeof drawingData === 'string' ? JSON.parse(drawingData) : drawingData;
    } catch (e) {
      return;
    }

    if (!strokes || strokes.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    strokes.forEach((stroke: any) => {
      const xCoords = stroke[0];
      const yCoords = stroke[1];
      xCoords.forEach((x: number) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); });
      yCoords.forEach((y: number) => { minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    });

    const drawWidth = maxX - minX;
    const drawHeight = maxY - minY;

    // 2. ĐÃ SỬA: Lề (padding) tự động theo tỷ lệ khung thay vì fix cứng số 15
    const padding = width * 0.15; 
    const scaleX = (width - padding * 2) / (drawWidth || 1);
    const scaleY = (height - padding * 2) / (drawHeight || 1);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (width - drawWidth * scale) / 2 - minX * scale;
    const offsetY = (height - drawHeight * scale) / 2 - minY * scale;

    strokes.forEach((stroke: any) => {
      const xCoords = stroke[0];
      const yCoords = stroke[1];

      if (xCoords.length > 0) {
        ctx.beginPath();
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

// --- SCREEN 6: COMMUNITY SCREEN  ---
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

  const handleLike = (e: any, id: number, currentLikes: number) => {
    e.stopPropagation();
    
    setLikedItems(prev => {
      const isCurrentlyLiked = prev[id];
      const newLikeCount = isCurrentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
      const updatedLikes = { ...prev, [id]: !isCurrentlyLiked };

      localStorage.setItem('artie_liked_drawings', JSON.stringify(updatedLikes));

      setCommunityDrawings(prevDrawings =>
        prevDrawings.map(item => item.id === id ? { ...item, like_count: newLikeCount } : item)
      );

      supabase
        .from('quickdraw_library')
        .update({ like_count: newLikeCount })
        .eq('id', id).then();

      return updatedLikes;
    });
  };

  return (
    <div className="h-full w-full bg-sky-100 p-3 sm:p-4 lg:p-5 flex flex-col relative overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center mb-2 lg:mb-4 shrink-0 gap-2">
        <button onClick={() => setScreen('home')} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-sm sm:text-base lg:text-xl hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0">⬅</button>
        <h1 className="flex-1 text-center text-base sm:text-lg lg:text-2xl font-black uppercase text-gray-800 truncate">Cộng đồng Artie</h1>
        <div className="w-8 sm:w-10 lg:w-12 shrink-0"></div>
      </div>

      {/* KHU VỰC CHỨA TRANH */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center text-lg lg:text-2xl font-bold text-gray-500">Đang tải tranh...</div>
      ) : communityDrawings.length === 0 ? (
        <div className="flex-1 flex justify-center items-center text-base lg:text-xl font-bold text-gray-500">Chưa có bức tranh nào được thả tim!</div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 pb-4 pt-1">
            {communityDrawings.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-xl lg:rounded-2xl border-2 sm:border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] sm:shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] p-2 lg:p-3 flex flex-col hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <div className="w-full aspect-square border-2 border-gray-200 rounded-lg lg:rounded-xl flex items-center justify-center mb-2 bg-gray-50 overflow-hidden relative pointer-events-none">
                  {item.drawing ? <MiniCanvas drawingData={item.drawing} /> : <span className="text-3xl">{item.emoji}</span>}
                </div>

                {/* ĐÃ SỬA: Đổi items-end thành items-start để nút thả tim luôn nằm trên cùng khi chữ rớt dòng */}
                <div className="flex justify-between items-start gap-1 w-full">
                  <div className="leading-tight flex-1 min-w-0">
                    {/* ĐÃ SỬA: Thay truncate bằng line-clamp-2 (tối đa 2 dòng) và thu nhỏ font chữ */}
                    <span className="font-black text-[10px] sm:text-[11px] lg:text-[12px] text-gray-700 block line-clamp-2">{item.word}</span>
                    <span className="font-bold text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 block mt-1">
                      {new Date(item.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleLike(e, item.id, item.like_count)}
                    className={`flex flex-col items-center hover:scale-110 active:scale-90 transition-all shrink-0 font-bold ${likedItems[item.id] ? 'text-red-500' : 'text-gray-300 hover:text-red-300'}`}
                  >
                    <span className="text-[12px] sm:text-[14px] lg:text-[16px] leading-none">{likedItems[item.id] ? '❤️' : '🤍'}</span>
                    <span className={`text-[8px] sm:text-[9px] lg:text-[11px] mt-0.5 ${likedItems[item.id] ? 'text-red-500' : 'text-gray-400'}`}>
                      {item.like_count}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedItem && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white border-[4px] lg:border-[6px] border-gray-800 rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] lg:shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] flex flex-col items-center w-[85%] max-w-[260px] sm:max-w-[320px] lg:max-w-[380px] max-h-[95%] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-red-400 text-white border-2 sm:border-4 border-gray-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-black text-lg sm:text-xl hover:bg-red-500 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] active:translate-y-1 active:shadow-none transition-all z-10"
            >
              X
            </button>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800 uppercase mb-2 sm:mb-4 text-center shrink-0">
              {selectedItem.word}
            </h2>

            {/* ĐÃ SỬA: Bọc khung ảnh bằng flex-1 min-h-0 để nó tự động bóp nhỏ lại nếu màn hình quá thấp */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center mb-2 sm:mb-4">
              {/* ĐÃ SỬA: Dùng h-full max-w-full aspect-square để giữ khung luôn vuông và nằm gọn bên trong */}
              <div className="h-full max-w-full aspect-square border-2 sm:border-4 border-gray-200 rounded-xl sm:rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden relative pointer-events-none p-2">
                {selectedItem.drawing ? <MiniCanvas drawingData={selectedItem.drawing} /> : <span className="text-5xl lg:text-6xl">{selectedItem.emoji}</span>}
              </div>
            </div>

            <div className="flex justify-between items-center w-full px-1 sm:px-2 shrink-0">
              <span className="font-bold text-gray-500 text-[10px] sm:text-xs lg:text-sm">
                Ngày vẽ: {new Date(selectedItem.created_at).toLocaleDateString('vi-VN')}
              </span>

              <button
                onClick={(e) => handleLike(e, selectedItem.id, selectedItem.like_count)}
                className={`flex items-center gap-1 font-black text-sm sm:text-base lg:text-xl hover:scale-110 active:scale-90 transition-transform ${likedItems[selectedItem.id] ? 'text-red-500' : 'text-gray-300'}`}
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