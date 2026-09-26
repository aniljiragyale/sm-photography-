import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    backend: 'http://localhost:4000',
    status: 'available',
  });
}
