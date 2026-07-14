import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { aiService } from './aiService';

// Import tất cả các màn hình bạn vừa tạo ở trên
import HomeScreen from './screens/HomeScreen';
import ReadyScreen from './screens/ReadyScreen';
import GameScreen from './screens/GameScreen';
import SummaryScreen from './screens/SummaryScreen';
import DetailScreen from './screens/DetailScreen';
import CommunityScreen from './screens/CommunityScreen';

// --- MAIN APP COMPONENT ---
export default function DrawingGameApp() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedDrawing, setSelectedDrawing] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);

  const [gameDrawings, setGameDrawings] = useState<any[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  const [isAiReady, setIsAiReady] = useState(false);

  useEffect(() => {
    aiService.load().then(() => {
      setIsAiReady(true);
    });
  }, []);

  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      const { data, error } = await supabase.from('game_words').select('*');
      if (error) throw error;

      if (data && data.length > 0) {
        const shuffledWords = [...data].sort(() => 0.5 - Math.random());
        const random3Words = shuffledWords.slice(0, 3).map((dbWord, index) => ({
          id: index + 1,
          word: dbWord.word,
          emoji: dbWord.emoji,
          label: dbWord.label,
          user: 'Bạn',
          shared: false,
          drawingData: null
        }));

        setGameDrawings(random3Words);
        setCurrentRound(0);
        setHintsLeft(3);
        setCurrentScreen('ready');
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách từ khóa:", error);
      alert("Không thể tải từ khóa, vui lòng kiểm tra kết nối!");
    } finally {
      setIsStarting(false);
    }
  };

  const handleNextRound = (drawingData: any, isWin: boolean) => {
    // 1. Cập nhật dữ liệu nét vẽ TRƯỚC (Đảm bảo tính bất biến)
    setGameDrawings(prevDrawings => {
      const updated = [...prevDrawings];
      if (updated[currentRound]) {
        // ✅ TẠO OBJECT MỚI THAY VÌ SỬA TRỰC TIẾP
        updated[currentRound] = {
          ...updated[currentRound],
          drawingData: drawingData,
          isWin: isWin
        };
      }
      return updated;
    });

    // 2. Tăng vòng chơi và chuyển màn hình SAU
    if (currentRound < 2) {
      setCurrentRound(prev => prev + 1);
      setCurrentScreen('ready');
    } else {
      setCurrentScreen('summary');
    }
  };
  const currentWordObj = gameDrawings[currentRound] || null;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen setScreen={setCurrentScreen} onStart={handleStartGame} isStarting={isStarting} />;
      case 'ready':
        return <ReadyScreen setScreen={setCurrentScreen} currentWord={currentWordObj} />;
      case 'game':
        return <GameScreen
          setScreen={setCurrentScreen}
          currentWord={currentWordObj}
          onNextRound={handleNextRound}
          hintsLeft={hintsLeft}
          setHintsLeft={setHintsLeft}
          isAiReady={isAiReady}
        />;
      case 'summary':
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