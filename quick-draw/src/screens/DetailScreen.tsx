import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import MiniCanvas from '../components/MiniCanvas';

export default function DetailScreen({ setScreen, drawing }: any) {
  const [relatedDrawings, setRelatedDrawings] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem('artie_liked_drawings') || '{}');
    setLikedItems(savedLikes);

    const fetchRelated = async () => {
      if (!drawing?.label) return;
      const { data } = await supabase
        .from('quickdraw_library')
        .select('*')
        .eq('label', drawing.label)
        .neq('id', drawing.id || 0)
        .limit(30); 

      if (data) {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setRelatedDrawings(shuffled.slice(0, 6)); 
      }
    };
    fetchRelated();
  }, [drawing]);

  const handleLike = (e: any, id: number, currentLikes: number) => {
    e.stopPropagation();

    setLikedItems(prev => {
      const isCurrentlyLiked = prev[id];
      const newLikeCount = isCurrentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
      const updatedLikes = { ...prev, [id]: !isCurrentlyLiked };

      localStorage.setItem('artie_liked_drawings', JSON.stringify(updatedLikes));

      setRelatedDrawings(prevDrawings =>
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
    <div className="h-full w-full bg-cyan-100 p-3 sm:p-4 lg:p-5 flex flex-col relative overflow-hidden">
      
      <div className="flex items-center mb-3 lg:mb-4 shrink-0 gap-2">
        <button
          onClick={() => setScreen('summary')}
          className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-white border-4 border-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] flex items-center justify-center text-base lg:text-xl hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shrink-0"
        >
          ⬅
        </button>
        <h1 className="flex-1 text-center text-lg sm:text-xl lg:text-2xl font-black uppercase text-gray-800 truncate">Chi tiết tác phẩm</h1>
        <div className="w-10 sm:w-11 lg:w-12 shrink-0"></div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-2xl lg:rounded-[2rem] border-4 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] p-2 lg:p-2 flex flex-col items-center justify-center relative mb-3 lg:mb-3">
        <div className="h-full max-w-full aspect-square relative pointer-events-none flex items-center justify-center">
          {drawing.drawingData && drawing.drawingData.length > 0 ? (
            <MiniCanvas drawingData={drawing.drawingData} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[120px] lg:text-[180px]">{drawing.emoji}</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl lg:rounded-[1.2rem] border-4 border-gray-800 shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] p-2.5 lg:p-2 shrink-0">
        <h3 className="font-black text-center mb-2 lg:mb-1.5 uppercase text-gray-700 text-xs lg:text-sm">Bản vẽ của các bạn khác</h3>

        {relatedDrawings.length === 0 ? (
          <p className="text-center text-gray-400 font-bold text-sm mb-1">Chưa có ai vẽ hình này!</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 px-1">
            {relatedDrawings.map(comm => (
              <div
                key={comm.id}
                // ĐÃ SỬA: Tăng w-[75px] h-[75px] trên mobile để ảnh dễ nhìn hơn
                className="relative shrink-0 w-[75px] h-[75px] sm:w-[85px] sm:h-[85px] lg:w-[80px] lg:h-[80px] bg-white rounded-xl lg:rounded-lg border-4 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] p-1 flex flex-col items-center overflow-hidden"
              >
                <button
                  onClick={(e) => handleLike(e, comm.id, comm.like_count || 0)}
                  className={`absolute top-0.5 right-0.5 z-10 text-[11px] lg:text-xs hover:scale-110 active:scale-90 transition-transform ${likedItems[comm.id] ? 'text-red-500' : 'text-gray-300 hover:text-red-300'}`}
                >
                  {likedItems[comm.id] ? '❤️' : '🤍'}
                </button>

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