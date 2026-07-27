# 🎨 AI Quick Draw Game

<p align="center">
  <img src="assets/banner.png" alt="AI Quick Draw Banner" width="100%">
</p>

<p align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4-orange?logo=tensorflow)
![YOLO](https://img.shields.io/badge/YOLO-Ultralytics-green)
![Supabase](https://img.shields.io/badge/Supabase-Storage-3FCF8E?logo=supabase)

</p>

An educational AI-powered drawing game inspired by **Google Quick, Draw!**. Players are asked to draw a randomly selected object within a limited time. The drawing is analyzed by a custom-trained Artificial Intelligence model running directly in the browser using **TensorFlow.js**.

---

# 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [AI Workflow](#-ai-workflow)
- [Dataset Collection](#-dataset-collection)
- [Supabase Storage](#-supabase-storage)
- [Training Pipeline](#-training-pipeline)
- [Why YOLO?](#-why-yolo)
- [Model Conversion](#-model-conversion)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Future Improvements](#-future-improvements)
- [Author](#-author)
- [License](#-license)

---

# 📖 Project Overview

AI Quick Draw Game is an educational web application that combines **Artificial Intelligence** and **Web Development** to create an interactive drawing experience.

Instead of storing image datasets directly, the project collects the original drawing stroke data from Google's Quick Draw dataset in **JSON** format. These JSON files are uploaded to **Supabase Storage** as a centralized dataset repository.

During model training on **Google Colab**, the JSON data is downloaded from storage, converted into grayscale images using **OpenCV**, preprocessed, and then used to train a **YOLO Classification** model.

After training, the model is converted into **TensorFlow.js** format so it can run directly inside the browser without requiring a backend AI server.

---

# ✨ Features

- 🎲 Random drawing challenges
- ✏️ Interactive drawing canvas
- ⏳ Countdown timer
- 💡 Visual hints for each drawing challenge
- 🤖 AI drawing recognition using a custom-trained YOLO model
- 🎚️ Difficulty level selection
- 📱 Responsive user interface
- ⚡ Browser-based AI inference with TensorFlow.js

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- HTML5 Canvas

## AI & Machine Learning

- Python
- Google Colab
- OpenCV
- NumPy
- Ultralytics YOLO
- TensorFlow
- TensorFlow.js

## Storage

- Supabase Storage

---

# 🏗️ System Architecture

```text
                   +----------------------+
                   | Google Quick Draw    |
                   |      Dataset         |
                   +----------+-----------+
                              |
                              |
                       Fetch JSON Data
                              |
                              |
                              ▼
                 +-------------------------+
                 |   Supabase Storage      |
                 +------------+------------+
                              |
                              |
                    Download JSON Dataset
                              |
                              ▼
                    Google Colab Training
                              |
                Convert JSON Stroke → Images
                              |
                              ▼
                     Image Preprocessing
                              |
                              ▼
                     YOLO Classification
                              |
                              ▼
                TensorFlow.js Model Export
                              |
                              ▼
                  React Web Application
```

---

# 📊 AI Workflow

```text
Google Quick Draw Dataset
            │
            ▼
Fetch JSON Stroke Data
            │
            ▼
Upload JSON Files
to Supabase Storage
            │
            ▼
Download Dataset
from Supabase Storage
            │
            ▼
Google Colab
            │
            ▼
Convert JSON → Images
(OpenCV)
            │
            ▼
Image Preprocessing
            │
            ▼
Train YOLO Classification
            │
            ▼
Export Best Model
            │
            ▼
Convert to TensorFlow.js
            │
            ▼
Deploy to React Website
```

---

# 📂 Dataset Collection

The project uses the **Google Quick Draw** dataset as the primary data source.

Instead of downloading image files, each drawing is collected as its original stroke information in **JSON** format.

Each JSON file contains a list of drawing strokes representing the user's drawing sequence.

Example:

```json
[
    [
        [12,18,25],
        [35,40,45]
    ],
    [
        [52,61],
        [78,88]
    ]
]
```

This approach provides several advantages:

- Smaller storage size.
- Preserve original drawing information.
- Images can be regenerated at any resolution.
- Easier preprocessing during training.
- Flexible image generation using OpenCV.

---
# ☁️ Supabase Storage

After collecting the dataset from Google Quick Draw, each drawing category is stored as a separate **JSON** file and uploaded to **Supabase Storage**.

Example:

```text
dataset/
│
├── ant.json
├── apple.json
├── bee.json
├── book.json
├── butterfly.json
├── candle.json
├── car.json
├── cat.json
├── donut.json
├── hamburger.json
└── ...
```

Supabase Storage acts as the centralized dataset repository for this project.

The website does **not** use these JSON files directly. Instead, they are downloaded during the training process on Google Colab.

---

# 🧪 Training Pipeline

The AI model is trained entirely on **Google Colab**, taking advantage of its cloud GPU environment.

The complete training workflow consists of the following steps.

## Step 1 — Download Dataset

Download all JSON files from Supabase Storage.

```text
Supabase Storage
        │
        ▼
Download JSON Files
```

---

## Step 2 — Convert JSON to Images

Each drawing consists of multiple strokes.

Using **OpenCV**, every stroke is rendered into a grayscale image that can be used for deep learning.

```text
JSON Stroke Data
        │
        ▼
OpenCV Rendering
        │
        ▼
PNG Image
```

This conversion is performed only during training.

The original dataset remains stored in JSON format.

---

## Step 3 — Image Preprocessing

Before training, every generated image is preprocessed.

The preprocessing pipeline includes:

- Convert stroke data into grayscale images.
- Resize images to the required input size.
- Normalize pixel values.
- Organize images into class folders.
- Prepare the dataset for YOLO Classification.

---

## Step 4 — Train YOLO Classification Model

After preprocessing, the dataset is used to train a YOLO Classification model.

Training is performed on **Google Colab GPU** using the **Ultralytics YOLO** framework.

The training process automatically generates:

- Training Loss
- Validation Loss
- Accuracy Metrics
- Best Model Weights

---

## Step 5 — Export Best Model

After training is completed, the model with the best validation performance is exported.

```text
best.pt
```

This model is then prepared for deployment.

---

# 🧠 Why YOLO?

The project initially experimented with a Convolutional Neural Network (CNN) for image classification.

Although the CNN model achieved acceptable performance, the training process showed slower convergence and less stable results when compared with YOLO.

After evaluating multiple approaches, **YOLO Classification** was selected as the final model because it offers several advantages:

- Better recognition performance.
- Faster inference speed.
- Stable training process.
- Efficient deployment.
- Well suited for the Quick Draw dataset.

For these reasons, YOLO became the final AI model used in this project.

---

# 🔄 Model Conversion

The trained YOLO model cannot be used directly inside a web browser.

Therefore, the model is converted into **TensorFlow.js** format.

The conversion process is illustrated below.

```text
YOLO Model
(best.pt)
      │
      ▼
TensorFlow SavedModel
      │
      ▼
TensorFlow.js Format
      │
      ▼
React Application
```

The generated TensorFlow.js files include:

```text
public/
└── model/
    ├── model.json
    ├── metadata.yaml
    ├── group1-shard1of2.bin
    └── group1-shard2of2.bin
```

These files are loaded directly by the React application during gameplay.

No backend server is required for AI inference.

---

# 📂 Project Structure

```text
AI-Quick-Draw/
│
├── public/
│   ├── images/
│   ├── hints/
│   └── model/
│       ├── model.json
│       ├── metadata.yaml
│       ├── group1-shard1of2.bin
│       └── group1-shard2of2.bin
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── training/
│   ├── fetch_dataset.py
│   ├── convert_json_to_image.py
│   ├── train_yolo.ipynb
│   └── export_tfjs.ipynb
│
├── package.json
├── vite.config.ts
└── README.md
```

---

# ⚙️ Installation

Clone the repository.

```bash
git clone https://github.com/your-username/your-repository.git
```

Move into the project folder.

```bash
cd your-repository
```

Install all required dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

Build the production version.

```bash
npm run build
```

Preview the production build locally.

```bash
npm run preview
```

---

# 📦 Requirements

Frontend

- Node.js
- npm

AI Training

- Python 3
- Google Colab
- TensorFlow
- OpenCV
- NumPy
- Ultralytics

Storage

- Supabase Storage

---

# 🚀 Usage

After launching the application, players can start a new game by selecting a difficulty level.

The game will randomly choose a drawing challenge based on the selected difficulty.

Players draw the requested object on the canvas before the countdown timer reaches zero.

When the drawing is completed, the AI model analyzes the sketch and determines whether it matches the expected object.

---

# 🎮 Gameplay

The game follows the workflow below.

```text
Select Difficulty
        │
        ▼
Generate Random Challenge
        │
        ▼
Display Hint Image
        │
        ▼
Start Countdown
        │
        ▼
Draw on Canvas
        │
        ▼
AI Recognition
        │
        ▼
Check Result
        │
        ▼
Next Challenge
```

---

# 🖥️ Application Workflow

```text
Player
   │
   ▼
Choose Difficulty
   │
   ▼
Random Drawing Challenge
   │
   ▼
Drawing Canvas
   │
   ▼
Canvas Image
   │
   ▼
TensorFlow.js Model
   │
   ▼
Prediction Result
   │
   ▼
Game Logic
   │
   ▼
Display Result
```

---

# 📸 Screenshots

The following screenshots can be added to demonstrate the application.

```text
Home Screen

Difficulty Selection

Drawing Canvas

Hint Display

Game Result
```

Example:

```markdown
## Home Screen

![Home](assets/home.png)

## Drawing Canvas

![Canvas](assets/canvas.png)

## Game Result

![Result](assets/result.png)
```

---

# 🌟 Project Highlights

- Uses Google's Quick Draw dataset.
- Stores the original dataset in JSON format instead of images.
- Converts JSON stroke data into images during training.
- Uses Supabase Storage as a centralized dataset repository.
- Trains a custom YOLO Classification model on Google Colab.
- Deploys the AI model using TensorFlow.js.
- Performs AI inference directly inside the browser.
- No backend server is required for prediction.

---

# 🔮 Future Improvements

Possible future enhancements include:

- Expand the dataset with additional drawing categories.
- Improve recognition accuracy with a larger training dataset.
- Optimize image preprocessing techniques.
- Add sound effects and background music.
- Introduce player authentication.
- Implement an online leaderboard.
- Support multiplayer gameplay.
- Improve the mobile user experience.
- Optimize application performance.

---

# 🤝 Acknowledgements

Special thanks to the following technologies and resources that made this project possible.

- Google Quick Draw Dataset
- Google Colab
- Ultralytics YOLO
- TensorFlow
- TensorFlow.js
- React
- Vite
- Tailwind CSS
- Supabase
- OpenCV

---

# 👨‍💻 Author

**Ngô Thị Minh Thi**

Computer Engineering Student

Saigon University

GitHub:

```
https://github.com/your-github
```

---

# 📄 License

This project was developed for educational purposes.

The Google Quick Draw dataset belongs to Google and is used in accordance with its publicly available resources.

---

# ⭐ Support

If you find this project useful, please consider giving it a ⭐ on GitHub.

Your support is greatly appreciated.
