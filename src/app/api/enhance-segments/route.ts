// src/app/api/enhance-segments/route.ts
import { NextResponse } from 'next/server';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Edge runtime for better performance with long-running requests
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { niche, segments, services } = await request.json();
    
    if (!segments || typeof segments !== 'string') {
      return NextResponse.json({ error: 'Invalid segments data' }, { status: 400 });
    }
    
    const prompt = `
      You are a market research expert specializing in high-ticket accounting advisory services. Below is a list of promising segments in the ${niche} area:

      ${segments.substring(0, 20000)}

      And here is a list of the services the client wants to avail: ${services}

      ## FORMAT INSTRUCTIONS

      Create an enhanced analysis with clear visual formatting. Consider markdown formatting. Begin with this centered title:

      # ENHANCED INDUSTRY RESEARCH FOR ${niche}

      Do not include introductory sentences.

      For each segment, use this exact visual formatting:

      ## SEGMENT #: *[SEGMENT NAME]*

      A. **Why this segment?**
        Explain why this segment needs premium accounting advisory services.
        Dicuss how this segment is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  

      B. **High-ticket justification** [Align/reflect your answers to any of the client's desired services mentioned above]
        • [Specific financial challenge/task]
        • [Specific financial challenge/task]
        • [Specific financial challenge/task]
        • [Specific financial challenge/task]

      C. **Hhow lucrative is this market?**
        Assess market size, growth trends, and profitability potential in 2-3 sentences.

      D. **Marketing angles**
        • [Compelling marketing message #1]
        • [Compelling marketing message #2]
        • [Compelling marketing message #3]

      ---\n\n
      Keep each section concise and actionable. Maintain consistent formatting with clear visual separation between segments and sections.
    `;

    
    // Try with different models if the first one fails
    const availableModels = [
      'google/gemini-2.0-flash-001',
      'qwen/qwq-32b',
      'deepseek/deepseek-r1-zero:free'
    ];
    
    let lastError = null;
    let responseData = null;
    
    // Try each model until one works
    for (const model of availableModels) {
      try {
        console.log(`Trying model: ${model}`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://market-segment-generator.vercel.app/',
            'X-Title': 'Market Segment Research',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            max_tokens: 25000,
            temperature: 0.8,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error with model ${model}:`, errorText);
          lastError = `OpenRouter API error with model ${model}: ${response.status} - ${errorText}`;
          continue; // Try the next model
        }
        
        responseData = await response.json();
        console.log(`Success with model: ${model}`);
        break; // We got a successful response, break out of the loop
        
      } catch (modelError: Error | unknown) {
        console.error(`Error with model ${model}:`, modelError);
        lastError = `Error with model ${model}: ${modelError instanceof Error ? modelError.message : String(modelError)}`;
        continue; // Try the next model
      }
    }
    
    // If we've tried all models and still don't have a response, throw the last error
    if (!responseData) {
      throw new Error(lastError || 'All models failed');
    }
    
    if (!responseData.choices?.[0]?.message) {
      return NextResponse.json({ 
        error: 'Invalid response format from OpenRouter',
        details: responseData 
      }, { status: 500 });
    }
      
    return NextResponse.json({ 
      result: responseData.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error enhancing segments:', error);
    return NextResponse.json({ 
      error: 'Failed to enhance segments',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}