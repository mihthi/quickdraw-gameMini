// import * as tf from '@tensorflow/tfjs';
// import { supabase } from './supabaseClient';

// class AIService {
//   model: tf.LayersModel | null = null;
//   labels: string[] = [];
//   dictionary: Record<string, string> = {};

//   async load() {
//     try {
//       const loadedModel = await tf.loadLayersModel('/model/model.json');
//       this.model = loadedModel;

//       const response = await fetch('/model/labels.json');
//       this.labels = await response.json();

//       const { data } = await supabase.from('game_words').select('word, label');
//       if (data) {
//         data.forEach((item) => { this.dictionary[item.label] = item.word; });
//       }
      
//       console.log("✅ AI đã sẵn sàng!");
//       return true;
//     } catch (error) {
//       console.error("❌ Lỗi load AI:", error);
//       return false;
//     }
//   }

//   // --- THÊM HÀM MỚI: Tự động cắt bỏ viền trắng thừa (Bounding Box) ---
//   preprocessCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
//     const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
//     if (!ctx) return sourceCanvas;

//     const width = sourceCanvas.width;
//     const height = sourceCanvas.height;
//     const imgData = ctx.getImageData(0, 0, width, height).data;

//     let minX = width, minY = height, maxX = 0, maxY = 0;
//     let hasPixels = false;

//     // Quét tìm giới hạn của nét vẽ
//     for (let y = 0; y < height; y++) {
//       for (let x = 0; x < width; x++) {
//         const alpha = imgData[(y * width + x) * 4 + 3];
//         const red = imgData[(y * width + x) * 4];
        
//         // Nét vẽ đen (#1f2937) sẽ có giá trị Red thấp và Alpha > 0
//         if (alpha > 0 && red < 200) {
//           minX = Math.min(minX, x);
//           maxX = Math.max(maxX, x);
//           minY = Math.min(minY, y);
//           maxY = Math.max(maxY, y);
//           hasPixels = true;
//         }
//       }
//     }

//     if (!hasPixels) return sourceCanvas; // Trả về gốc nếu canvas trống

//     // Thêm một lớp đệm (Padding) để nét vẽ không dính sát mép ảnh
//     const padding = 20;
//     minX = Math.max(0, minX - padding);
//     minY = Math.max(0, minY - padding);
//     maxX = Math.min(width, maxX + padding);
//     maxY = Math.min(height, maxY + padding);

//     const cropWidth = maxX - minX;
//     const cropHeight = maxY - minY;

//     // Ép khung cắt thành hình vuông để khi scale về 28x28 không bị méo tỉ lệ
//     const size = Math.max(cropWidth, cropHeight);
//     const croppedCanvas = document.createElement('canvas');
//     croppedCanvas.width = size;
//     croppedCanvas.height = size;
    
//     const cropCtx = croppedCanvas.getContext('2d');
//     if (cropCtx) {
//       cropCtx.fillStyle = "white";
//       cropCtx.fillRect(0, 0, size, size);
      
//       // Vẽ hình cắt được vào chính giữa canvas vuông
//       const offsetX = (size - cropWidth) / 2;
//       const offsetY = (size - cropHeight) / 2;
//       cropCtx.drawImage(
//         sourceCanvas,
//         minX, minY, cropWidth, cropHeight,
//         offsetX, offsetY, cropWidth, cropHeight
//       );
//     }

//     return croppedCanvas;
//   }

//   async predict(canvas: HTMLCanvasElement): Promise<{ label: string, word: string } | null> {
//     if (!this.model) return null;

//     // Gọi hàm preprocess trước khi dự đoán
//     const processedCanvas = this.preprocessCanvas(canvas);

//     return tf.tidy(() => {
//       let img = tf.browser.fromPixels(processedCanvas, 3);
//       let resized = tf.image.resizeBilinear(img, [28, 28]);
//       let grayscale = tf.image.rgbToGrayscale(resized);
      
//       // Invert màu (nền đen, chữ trắng) cho khớp với trọng số
//       let inverted = tf.scalar(255).sub(grayscale);
//       let normalized = inverted.toFloat().div(255).expandDims(0);
      
//       const prediction = this.model!.predict(normalized) as tf.Tensor;
//       const probabilities = prediction.dataSync();
//       const index = prediction.argMax(1).dataSync()[0];
//       const probability = probabilities[index];

//       // Ngưỡng tự tin có thể giảm nhẹ vì dữ liệu đầu vào đã được làm sạch tốt hơn
//       if (probability < 0.3) return null;

//       const label = this.labels[index];
//       return { label: label, word: this.dictionary[label] || label };
//     });
//   }
// }

// export const aiService = new AIService();


import * as tf from '@tensorflow/tfjs';
import { supabase } from './supabaseClient';

class AIService {
  // SỬA ĐỔI 1: YOLO sử dụng GraphModel thay vì LayersModel
  model: tf.GraphModel | null = null;
  labels: string[] = [];
  dictionary: Record<string, string> = {};

  async load() {
    try {
      // SỬA ĐỔI 2: Dùng loadGraphModel để đọc file model.json của YOLO
      const loadedModel = await tf.loadGraphModel(`/model/model.json?cache_bust=${Date.now()}`);
      this.model = loadedModel;

      const response = await fetch('/model/labels.json');
      this.labels = await response.json();

      const { data } = await supabase.from('game_words').select('word, label');
      if (data) {
        data.forEach((item) => { this.dictionary[item.label] = item.word; });
      }
      
      console.log("✅ AI (YOLO) đã sẵn sàng!");
      return true;
    } catch (error) {
      console.error("❌ Lỗi load AI:", error);
      return false;
    }
  }

  // Giữ nguyên hoàn toàn hàm xử lý cắt viền cực kỳ tốt của bạn
  preprocessCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return sourceCanvas;

    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const imgData = ctx.getImageData(0, 0, width, height).data;

    let minX = width, minY = height, maxX = 0, maxY = 0;
    let hasPixels = false;

    // Quét tìm giới hạn của nét vẽ
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = imgData[(y * width + x) * 4 + 3];
        const red = imgData[(y * width + x) * 4];
        
        // Nét vẽ đen (#1f2937) sẽ có giá trị Red thấp và Alpha > 0
        if (alpha > 0 && red < 200) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          hasPixels = true;
        }
      }
    }

    if (!hasPixels) return sourceCanvas;

    // Thêm một lớp đệm (Padding) để nét vẽ không dính sát mép ảnh
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width, maxX + padding);
    maxY = Math.min(height, maxY + padding);

    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;

    // Ép khung cắt thành hình vuông
    const size = Math.max(cropWidth, cropHeight);
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = size;
    croppedCanvas.height = size;
    
    const cropCtx = croppedCanvas.getContext('2d');
    if (cropCtx) {
      cropCtx.fillStyle = "white";
      cropCtx.fillRect(0, 0, size, size);
      
      const offsetX = (size - cropWidth) / 2;
      const offsetY = (size - cropHeight) / 2;
      cropCtx.drawImage(
        sourceCanvas,
        minX, minY, cropWidth, cropHeight,
        offsetX, offsetY, cropWidth, cropHeight
      );
    }

    return croppedCanvas;
  }

  async predict(canvas: HTMLCanvasElement): Promise<{ label: string, word: string } | null> {
    if (!this.model) return null;

    const processedCanvas = this.preprocessCanvas(canvas);

    return tf.tidy(() => {
      // 1. Trích xuất ma trận điểm ảnh với 3 kênh màu (RGB)
      let img = tf.browser.fromPixels(processedCanvas, 3);
      
      // SỬA ĐỔI 3: Resize về 64x64 theo đúng chuẩn mô hình đã train
      let resized = tf.image.resizeBilinear(img, [64, 64]);
      
      // SỬA ĐỔI 4: Đảo ngược màu trực tiếp trên ảnh RGB (Bỏ qua bước chuyển Grayscale)
      // Chuyển nền trắng nét đen -> nền đen nét trắng
      let inverted = tf.scalar(255).sub(resized);
      
      // 2. Chuẩn hóa giá trị pixel về [0, 1] và thêm chiều batch -> shape: [1, 64, 64, 3]
      let normalized = inverted.toFloat().div(255).expandDims(0);
      
      // 3. Dự đoán (Inference)
      const prediction = this.model!.predict(normalized) as tf.Tensor;
      const probabilities = prediction.dataSync();
      const index = prediction.argMax(1).dataSync()[0];
      const probability = probabilities[index];

      // Ngưỡng tự tin có thể để thấp hơn vì YOLO bắt nét khá nhạy
      if (probability < 0.3) return null;

      const label = this.labels[index];
      return { label: label, word: this.dictionary[label] || label };
    });
  }
}

export const aiService = new AIService();