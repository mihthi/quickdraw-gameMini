import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import MiniCanvas from '../components/MiniCanvas';

export default function CommunityScreen({ setScreen }: any) {
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
      <div className="flex items-center mb-2 lg:mb-4 shrink-0 gap-2">
        <button onClick={() => setScreen('home')} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-sm sm:text-base lg:text-xl hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0">⬅</button>
        <h1 className="flex-1 text-center text-base sm:text-lg lg:text-2xl font-black uppercase text-gray-800 truncate">Cộng đồng Artie</h1>
        <div className="w-8 sm:w-10 lg:w-12 shrink-0"></div>
      </div>

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

                <div className="flex justify-between items-start gap-1 w-full">
                  <div className="leading-tight flex-1 min-w-0">
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

            <div className="flex-1 min-h-0 w-full flex items-center justify-center mb-2 sm:mb-4">
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