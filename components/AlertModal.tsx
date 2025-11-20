'use client';

import { useVideoStore } from '@/store/videoStore';

export default function AlertModal() {
  const { error, status, setError, reset } = useVideoStore();

  if (!error && status !== 'failed') {
    return null;
  }

  const handleClose = () => {
    setError(null);
    if (status === 'failed') {
      reset();
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <svg
            className="w-6 h-6 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Error
        </h3>
        <p className="py-4">
          {error || 'Failed to process the video. Please try again.'}
        </p>
        <div className="modal-action">
          <button onClick={handleClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={handleClose} />
    </div>
  );
}
