# Sora 2 Watermark Remover

A modern web application for removing watermarks from Sora AI videos, built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- **Drag & Drop Upload**: Easily upload videos by dragging and dropping or clicking to browse
- **Real-time Progress**: Visual progress indicator showing upload and processing status
- **Before/After Preview**: Side-by-side comparison of original and processed videos
- **Instant Download**: Download the watermark-free video with one click
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: User-friendly error messages and validation

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 16.0.3
- **Language**: TypeScript 5.9.3
- **State Management**: Zustand 5.0.8
- **Styling**: Tailwind CSS 4.1.17 + DaisyUI 5.5.5
- **HTTP Client**: Axios 1.13.2
- **File Upload**: React Dropzone 14.3.8

## Getting Started

### Prerequisites

- Bun installed on your system

### Installation

1. Install dependencies:
```bash
bun install
```

2. (Optional) Configure backend URL - Create `.env.local`:
```bash
BACKEND_URL=http://localhost:5344
```

3. Run the development server:
```bash
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/                          # Next.js API proxy routes (no CORS!)
│   │   ├── submit_remove_task/       # Proxies video upload to backend
│   │   ├── get_results/              # Proxies status checks to backend
│   │   └── download/[taskId]/        # Proxies video download to backend
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main page with upload/polling logic
│   └── globals.css                   # Global styles
├── components/                       # React components
│   ├── VideoUploader.tsx             # Drag & drop upload
│   ├── ProgressBar.tsx               # Progress indicator
│   ├── VideoPreview.tsx              # Before/after comparison
│   ├── AlertModal.tsx                # Error modal
│   └── DownloadButton.tsx            # Download button
├── store/
│   └── videoStore.ts                 # Zustand state management
├── services/
│   └── api.ts                        # API client (calls Next.js routes)
└── types/
    └── index.ts                      # TypeScript types
```

## API Integration

### Architecture: Proxy Pattern (No CORS!)

The app uses Next.js API routes as a **server-side proxy** to eliminate CORS issues:

```
Browser → /api/* → Next.js Server → Backend (http://localhost:5344)
```

**Benefits:**
- ✅ No CORS errors (all requests are same-origin)
- ✅ Backend URL hidden from client
- ✅ Server-side validation before proxying
- ✅ Easy to configure via environment variable

### Backend Configuration

**Option 1: Use Default (for local development)**
- No setup needed, defaults to `http://localhost:5344`

**Option 2: Custom Backend URL**
1. Create `.env.local` file in project root:
   ```bash
   BACKEND_URL=http://your-backend-url:port
   ```
2. Restart the dev server

### Backend Requirements

The backend server (https://github.com/linkedlist771/SoraWatermarkCleaner) must implement:

- **`POST /submit_remove_task`** - Upload video
  - Accepts: `multipart/form-data` with `video` field
  - Returns: `{ task_id: string }`

- **`GET /get_results?remove_task_id={taskId}`** - Check processing status
  - Returns: `{ percentage: number, status: 'UPLOADING'|'PROCESSING'|'FINISHED'|'ERROR', download_url: string | null }`

- **`GET /download/{taskId}`** - Download processed video
  - Returns: Video blob with `Content-Type: video/mp4`

### Next.js API Routes (Proxy Layer)

Frontend calls these routes, which proxy to the backend:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/submit_remove_task` | POST | Proxies video upload |
| `/api/get_results?remove_task_id=...` | GET | Proxies status check |
| `/api/download/{taskId}` | GET | Proxies video download |

## File Validation

- **Supported formats**: MP4, MOV, WebM, AVI
- **Maximum file size**: 500MB
- Automatic validation on upload

## User Journey

1. User lands on the homepage
2. Drag & drop or click to upload a video
3. Click "Remove Watermark!" button
4. View real-time progress (upload → processing)
5. See before/after comparison when complete
6. Download the processed video
7. Option to remove another video

## Building for Production

```bash
bun run build
bun run start
```

## License

This project is for educational purposes.
