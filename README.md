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
