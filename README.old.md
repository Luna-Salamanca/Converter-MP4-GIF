# Video GIF Converter

A powerful, purely client-side tool to convert videos into high-quality GIFs. Built with React, TypeScript, and Vite.

## Features

- **Video Upload**: Drag and drop video files (MP4, WebM, MOV).
- **Client-Side Processing**: All video conversion happens locally in your browser using `gif.js` with multi-threading support - no server required.
- **Privacy First**: Your videos never leave your device.
- **Professional Timeline**:
  - **Smooth Playback**: High-performance playback engine.
  - **Precise Trimming**: Drag handles to select the exact clip you want.
  - **Manual Time Entry**: Click the timecode to jump to a specific frame (e.g., "12.5" or "00:12.50").
  - **Frame Stepping**: Step forward/backward by 1 second for precise positioning.
- **Crop & Resize**: Focus on the action with intuitive crop controls and resize presets (HD, Social, Mobile).
- **Settings Control**: Adjust FPS (up to 60fps), quality/compression, and dimensions.
- **Preview**: Real-time preview of the generated GIF.
- **Export**: Download your creation instantly.

## Prerequisites

- [Node.js](https://nodejs.org/) (Version 20.x or higher recommended)
- [npm](https://www.npmjs.com/) (Usually comes with Node.js)

## Installation Guide

Follow these steps to set up the project locally.

### 1. Clone or Download the Repository

If you have git installed:

```bash
git clone <repository-url>
cd video-gif-converter
```

Or download the ZIP file and extract it.

### 2. Install Dependencies

Navigate to the project directory and run:

```bash
npm install
```

### 3. Running the Application

Start the development server:

```bash
npm run dev:client
```

- The application will start on port 5000.
- Open [http://localhost:5000](http://localhost:5000) in your browser.
- You can now use the full application functionality offline!

## Project Structure

- `client/`: Frontend React application
  - `src/components/`: Reusable UI components (Timeline, Player, Settings)
  - `src/pages/`: Application pages (Home, Editor)
  - `src/lib/`: Utilities and helper functions
- `shared/`: Shared TypeScript schemas and types

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, shadcn/ui
- **GIF Processing**: gif.js (Client-side JS with Web Workers)
- **Icons**: Lucide React
