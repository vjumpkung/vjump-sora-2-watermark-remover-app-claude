import { NextRequest, NextResponse } from 'next/server';

// Simulated processing time: 10 seconds
const PROCESSING_TIME = 10000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Simulate task tracking (in a real app, this would check a database)
    // For this mock, we'll use the taskId timestamp to calculate progress
    const timestamp = parseInt(taskId.split('_')[1]);
    if (isNaN(timestamp)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 404 }
      );
    }

    const elapsed = Date.now() - timestamp;
    const progress = Math.min(100, Math.floor((elapsed / PROCESSING_TIME) * 100));

    let status: 'processing' | 'completed' = 'processing';
    let message = 'Processing video...';

    if (progress >= 100) {
      status = 'completed';
      message = 'Watermark removed successfully';
    }

    return NextResponse.json({
      task_id: taskId,
      status,
      progress,
      message,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
