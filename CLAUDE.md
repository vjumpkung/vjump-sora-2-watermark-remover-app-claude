# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sora 2 Watermark Remover - A Next.js application for removing watermarks from Sora AI videos with drag & drop upload, real-time progress tracking, and before/after video preview.

**Runtime**: Bun (not npm/yarn/pnpm)
**Framework**: Next.js 16.0.3 + React 19.2.0 + TypeScript 5.9.3
**Styling**: Tailwind CSS 4.1.17 + DaisyUI 5.5.5

## Development Commands

```bash
# Install dependencies
bun install

# Run development server (http://localhost:3000)
bun run dev

# Build for production
bun run build

# Run production server
bun run start

# Lint code
bun run lint
```

## Key Features

### User Experience Enhancements

- **Visual File Selection Feedback**: After selecting a video, the upload area transforms with a green checkmark, displaying the filename and file size for clear confirmation
- **Drag & Drop Upload**: Intuitive file upload with visual feedback during drag operations
- **Real-time Progress**: Smooth progress bar with percentage and status messages
- **Error Handling**: User-friendly error messages via modal alerts
- **Responsive Design**: Mobile-friendly interface that adapts to all screen sizes

## Architecture

### State Management Flow

The app uses a centralized Zustand store (`store/videoStore.ts`) for all video processing state:
- **State**: `status`, `taskId`, `progress`, `originalVideo`, `processedVideoUrl`, `error`
- **Actions**: `setStatus`, `setTaskId`, `setProgress`, `setOriginalVideo`, `setProcessedVideoUrl`, `setError`, `reset`
- **Status lifecycle**: `idle` → `uploading` → `processing` → `completed`/`failed`
- All components access store via `useVideoStore()` hook

The `setProgress` action accepts either a number or a function `(prev: number) => number` for functional updates.

### Async Processing Pattern

**Key Pattern**: Upload → Poll → Download

1. **Upload Phase** (`app/page.tsx:82-121`):
   - User clicks "Remove Watermark!" button
   - Frontend simulates upload progress (lines 94-102): 200ms intervals, increments by 10%
   - Calls `videoApi.uploadVideo()` which POSTs to backend
   - Receives `{ task_id: string }` response
   - Transitions to `processing` status

2. **Polling Phase** (`app/page.tsx:27-80`):
   - useEffect hook activates when `status === 'processing'`
   - Polls every 2 seconds via `videoApi.checkStatus(taskId)`
   - Updates progress from backend's `percentage` field
   - Maps backend status to frontend:
     - `FINISHED` → `completed` + auto-downloads video
     - `ERROR` → `failed` + sets error message
   - **Critical**: Properly cleans up interval on unmount/status change

3. **Download Phase**:
   - When backend returns `FINISHED`, automatically calls `videoApi.downloadVideo(taskId)`
   - Creates blob URL with `URL.createObjectURL(videoBlob)`
   - Stores in `processedVideoUrl` state

**Memory Leak Prevention**: The polling interval ref (`pollingIntervalRef`) is cleared in three scenarios:
- Status becomes `completed`
- Status becomes `failed`
- Component unmounts (cleanup function)

### Backend Integration

**API Proxy Architecture** - All backend calls are routed through Next.js API routes to prevent CORS errors:

```
Browser → /api/* → Next.js Server → Backend Server (http://localhost:5344)
```

**Frontend Configuration** (`services/api.ts:5`):
```typescript
baseURL: '/api/'  // Calls Next.js API routes, not backend directly
```

**Next.js API Proxy Routes** (in `app/api/`):
Each route proxies requests to the backend server-side, eliminating CORS issues:

1. **`app/api/submit_remove_task/route.ts`**:
   - Receives: `FormData` with video file
   - Validates: File type (MP4, MOV, WebM, AVI)
   - Proxies to: `${BACKEND_URL}/submit_remove_task`
   - Returns: `{ task_id: string }`

2. **`app/api/get_results/route.ts`**:
   - Receives: `?remove_task_id={taskId}` query param
   - Proxies to: `${BACKEND_URL}/get_results?remove_task_id={taskId}`
   - Returns: `{ percentage: number, status: BackendStatus, download_url: string | null }`

3. **`app/api/download/[taskId]/route.ts`**:
   - Receives: `taskId` as dynamic route parameter
   - Proxies to: `${BACKEND_URL}/download/{taskId}`
   - Returns: Video blob with appropriate headers

**Backend URL Configuration**:
- Environment variable: `BACKEND_URL` (defaults to `http://localhost:5344`)
- Set in `.env.local` to customize:
  ```bash
  BACKEND_URL=http://localhost:5344
  ```
- Each proxy route reads this value at runtime (`app/api/*/route.ts:3`)

**Backend Server** (https://github.com/linkedlist771/SoraWatermarkCleaner):
- `POST /submit_remove_task` - Upload video, returns `{ task_id: string }`
- `GET /get_results?remove_task_id={taskId}` - Check status, returns `{ percentage: number, status: BackendStatus, download_url: string | null }`
- `GET /download/{taskId}` - Download processed video blob

**Status Mapping**:
- **Backend types** (`types/index.ts:5`): `'UPLOADING' | 'PROCESSING' | 'FINISHED' | 'ERROR'`
- **Frontend types** (`types/index.ts:2`): `'idle' | 'uploading' | 'processing' | 'completed' | 'failed'`
- Mapping logic in `app/page.tsx:37-58`

**Why Proxy Architecture?**
- ✅ **No CORS errors** - All requests are same-origin from browser perspective
- ✅ **Security** - Backend URL not exposed to client
- ✅ **Flexibility** - Easy to switch backends via environment variable
- ✅ **Validation** - Server-side file validation before proxying

### Component Rendering Logic

Components are conditionally rendered based on `status` from store (`app/page.tsx:123-177`):
- **Upload UI** (`status === 'idle'`): `VideoUploader` + "Remove Watermark!" button
- **Progress UI** (`status === 'uploading' || 'processing'`): `ProgressBar` in card
- **Result UI** (`status === 'completed'`): `VideoPreview` (before/after) + `DownloadButton`
- **Error UI** (any status with `error !== null`): `AlertModal`

All state transitions happen in `app/page.tsx` - components are presentational and read from store.

### File Upload & Validation

**VideoUploader Component** (`components/VideoUploader.tsx`):

The uploader has two distinct visual states for better UX:

1. **No File Selected** (lines 108-136):
   - Gray dashed border with hover effects
   - Upload cloud icon
   - "Drag & drop your video here" text
   - Supported formats and size limit info

2. **File Selected** (lines 75-105):
   - **Green border** (`border-success`) and light green background
   - **Checkmark icon** - Clear visual confirmation
   - **"File Selected"** label in green
   - **Filename display** - Shows actual filename (line 96)
   - **File size** - Formatted size display using `formatFileSize()` helper (lines 50-56)
   - **Change file hint** - "Click to select a different file"

**Validation** happens at three layers:

1. **Frontend** (`components/VideoUploader.tsx:37-48`):
   - react-dropzone validates file types: `video/mp4`, `video/quicktime`, `video/webm`, `video/x-msvideo`
   - Max file size: 500MB (line 7)
   - User-friendly error messages for rejections (lines 16-25)

2. **Next.js API Proxy** (`app/api/submit_remove_task/route.ts:17-24`):
   - Server-side validation before proxying to backend
   - Validates same MIME types as frontend
   - Returns 400 error for invalid types

3. **Backend Server**: Should implement equivalent validation for security

## TypeScript Types

All types defined in `types/index.ts`:

```typescript
// Frontend status enum
ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'

// Backend status enum
BackendStatus = 'UPLOADING' | 'PROCESSING' | 'FINISHED' | 'ERROR'

// API response contracts
UploadResponse = { task_id: string }
StatusResponse = { percentage: number, status: BackendStatus, download_url: string | null }

// Domain models
VideoFile = { file: File, preview: string }

// Zustand store shape
VideoState = {
  status: ProcessingStatus
  taskId: string | null
  progress: number
  originalVideo: VideoFile | null
  processedVideoUrl: string | null
  error: string | null
  setStatus: (status: ProcessingStatus) => void
  setTaskId: (taskId: string | null) => void
  setProgress: (progress: number | ((prev: number) => number)) => void
  setOriginalVideo: (video: VideoFile | null) => void
  setProcessedVideoUrl: (url: string | null) => void
  setError: (error: string | null) => void
  reset: () => void
}
```

## Styling

Uses Tailwind CSS 4 + DaisyUI 5:

### Tailwind CSS 4 Migration Notes

**Major Changes from v3 to v4:**
- **CSS-First Configuration**: Uses `@import "tailwindcss"` instead of `@tailwind` directives (`app/globals.css:1`)
- **Plugin Loading**: Plugins loaded via `@plugin` directive in CSS (`app/globals.css:2`)
- **Config Reference**: Uses `@config` directive to reference tailwind.config.ts (`app/globals.css:4`)
- **PostCSS Plugin**: Uses `@tailwindcss/postcss` instead of `tailwindcss` package (`postcss.config.mjs:3`)
- **Simplified Config**: `tailwind.config.ts` now only contains content paths and no plugins/theme extensions

### DaisyUI 5 Configuration

- **Version**: DaisyUI 5.5.5 (first version compatible with Tailwind CSS 4)
- **Loading Method**: Use `@plugin "daisyui"` in CSS file instead of plugins array in config
- **Themes**: Default themes available: `light`, `dark`, `cupcake`
- **Components**: `btn`, `btn-primary`, `btn-lg`, `card`, `modal`, `loading`
- **Responsive Design**: Mobile-first approach
- **Custom Animations**: Gradient animations in `ProgressBar.tsx:25`

### Migration Summary

1. **package.json**: Updated to use `@tailwindcss/postcss@4.1.17` and `tailwindcss@4.1.17`
2. **postcss.config.mjs**: Changed from `tailwindcss: {}` to `'@tailwindcss/postcss': {}`
3. **app/globals.css**:
   - Changed from `@tailwind base/components/utilities` to `@import "tailwindcss"`
   - Added `@plugin "daisyui"` for DaisyUI integration
   - Added `@config "../tailwind.config.ts"` to reference config file
4. **tailwind.config.ts**: Removed plugins array and theme extensions (now handled by DaisyUI plugin)

## Key Files Reference

- `app/page.tsx` - Main orchestrator, handles upload + polling logic
- `store/videoStore.ts` - Zustand state management
- `services/api.ts` - Axios API client, calls Next.js API routes (not backend directly)
- `app/api/submit_remove_task/route.ts` - Proxy route for video upload
- `app/api/get_results/route.ts` - Proxy route for status polling
- `app/api/download/[taskId]/route.ts` - Proxy route for video download
- `types/index.ts` - TypeScript type definitions
- `components/VideoUploader.tsx` - Drag & drop with react-dropzone, file selection indicator with filename/size display
- `components/ProgressBar.tsx` - Animated progress indicator
- `components/VideoPreview.tsx` - Before/after video comparison
- `components/AlertModal.tsx` - Error modal
- `components/DownloadButton.tsx` - Download processed video

## Component Details

### VideoUploader (`components/VideoUploader.tsx`)
- Reads `originalVideo` from store to display selected file info
- Conditional rendering: shows upload prompt OR file confirmation
- `formatFileSize()` helper function converts bytes to human-readable format (KB, MB, GB)
- Dynamic styling: gray border (no file) → green border + checkmark (file selected)
- Disabled state during upload/processing
