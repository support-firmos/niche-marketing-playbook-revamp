import { NextResponse } from 'next/server';
import { generateOneTimeOffer } from '@/lib/oneTimeOfferService';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Edge runtime for better performance with long-running requests
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { text } = requestData;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid text input' }, { status: 400 });
    }
    
    console.log('Received request to generate one-time offer');
    
    // Call the service function with the provided text
    const result = await generateOneTimeOffer(text);
    
    console.log('Successfully generated one-time offer');
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error generating one-time offer:', error);
    return NextResponse.json({ error: 'Failed to generate one-time offer' }, { status: 500 });
  }
} 