import React from 'react';
import './LevelSelectScreen.css';

const bgImage = "/assets/background-second.png";
const robotImage = "/assets/icon-robot-pink.png";

// 1. KHAI BÁO 2 ẢNH RIÊNG BIỆT CHO 2 NÚT TẠI ĐÂY
const anhNutTreEm = "/assets/button-for-kid.png";   // Sửa lại đúng tên file ảnh của bạn
const anhNutNguoiLon = "/assets/button-for-adult.png"; // Sửa lại đúng tên file ảnh của bạn

export default function LevelSelectScreen({ setScreen, onSelectLevel }: any) {
  
  const handleSelectLevel = (level: 'tre-em' | 'nguoi-lon') => {
    if (onSelectLevel) {
      onSelectLevel(level);
    }
  };

  return (
    <div 
      className="level-screen-container" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <button className="back-btn" onClick={() => setScreen('home')}>
        <span className="back-icon">↩</span> Trở Về
      </button>

      <div className="wood-board">
        <div className="board-content">
          <h1 className="main-title">
            <span className="text-pink">Chọn</span> <span className="text-blue">mức độ</span> <br/>
            <span className="text-pink">mong</span> <span className="text-yellow">muốn</span>
          </h1>
          <p className="subtitle">Chọn cấp độ để bắt đầu:</p>

          <div className="cards-container">
            
            {/* 2. GẮN ẢNH NÚT TRẺ EM VÀO ĐÂY */}
            <button 
              className="level-card" 
              onClick={() => handleSelectLevel('tre-em')}
            >
              <img src={anhNutTreEm} alt="Nút Trẻ Em" className="card-bg-img" />
              <div className="card-label">TRẺ EM</div>
            </button>

            {/* 3. GẮN ẢNH NÚT NGƯỜI LỚN VÀO ĐÂY */}
            <button 
              className="level-card" 
              onClick={() => handleSelectLevel('nguoi-lon')}
            >
              <img src={anhNutNguoiLon} alt="Nút Người Lớn" className="card-bg-img" />
              <div className="card-label">NGƯỜI LỚN</div>
            </button>

          </div>
        </div>
      </div>

      <img src={robotImage} alt="Robot" className="floating-robot" />
    </div>
  );
}