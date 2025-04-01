import { NextResponse } from 'next/server';
import { formatDeepResearchForDisplay } from '@/app/utilities/formatDeepResearch';

export const maxDuration = 60;
export const runtime = 'edge';

// Helper function to clean and parse JSON
function cleanAndParseJSON(content: string) {
  try {
    // Remove any markdown code block markers
    let cleanedContent = content.replace(/```json|```/g, '').trim();
    
    // Find the first { and last }
    const firstBrace = cleanedContent.indexOf('{');
    const lastBrace = cleanedContent.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No valid JSON object found');
    }
    
    // Extract only the JSON portion
    cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
    
    // Remove any trailing commas before closing braces
    cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');
    
    // Remove any comments
    cleanedContent = cleanedContent.replace(/\/\/.*/g, '');
    
    // Try to parse the cleaned content
    const parsed = JSON.parse(cleanedContent);
    
    // Validate the structure
    if (!parsed.name || !Array.isArray(parsed.fears) || !Array.isArray(parsed.pains)) {
      throw new Error('Invalid segment structure');
    }
    
    return parsed;
  } catch (error) {
    console.error('Error cleaning and parsing JSON:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    console.log('Generate-segments API called');
    
    const requestData = await request.json();
    const { content } = requestData;
    
    if (!content) {
      console.error('content lacking');
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const segments = splitSegments(content);
    console.log("segments: ", segments)
    
    const segmentPromises = segments.map(async (segment) => {
      const segmentPrompt = `
You are an empathetic B2B Researcher capable of deeply understanding and embodying the Ideal Customer Profile (ICP) for high-ticket advisory and consulting services.

## Your Task
Analyze the ICP provided below and generate a comprehensive market research profile for the segment following the exact structure below. Use the information to identify the most relevant and impactful insights.
Provide exactly 5 items per category.

CRITICAL REQUIREMENTS:
1. Your response must be ONLY a valid JSON object
2. Do not include any text before or after the JSON
3. DO NOT change the segment name from what is given below.
3. Do not include any comments or explanations
4. Ensure all arrays have exactly 5 items
5. Do not include trailing commas
6. Use double quotes for all strings
7. Do not include any markdown formatting

Here is the exact structure you must follow:

{
  "name": "EXACT segment name here",
  "fears": [
    {
      "title": "Fear title here",
      "explanation": "Comprehensive explanation of the fear including real-world business impact",
      "advisoryHelp": "How high-ticket advisory services address this fear"
    }
  ],
  "pains": [
    {
      "title": "Pain point title here",
      "explanation": "Comprehensive explanation of the pain including negative consequences",
      "advisoryHelp": "How high-ticket advisory services address this pain point"
    }
  ],
  "objections": [
    {
      "title": "Objection title here",
      "explanation": "Comprehensive explanation of the objection including client concerns",
      "advisoryHelp": "How to counter with benefits of high-ticket advisory services"
    }
  ],
  "goals": [
    {
      "title": "Goal title here",
      "explanation": "Comprehensive explanation of the goal including desired outcomes",
      "advisoryHelp": "How high-ticket advisory services help attain this goal"
    }
  ],
  "values": [
    {
      "title": "Value title here",
      "explanation": "Comprehensive explanation of the value including impact on decision-making",
      "advisoryHelp": "How high-ticket advisory services align with this value"
    }
  ],
  "decisionMaking": [
    {
      "title": "Decision-making process title here",
      "explanation": "Comprehensive explanation including stakeholders and timeframes",
      "advisoryHelp": "How high-ticket advisory services fit into this process"
    }
  ],
  "influences": [
    {
      "title": "Influence title here",
      "explanation": "Comprehensive explanation of the influence including how it shapes perceptions",
      "advisoryHelp": "How high-ticket advisory services can leverage this influence"
    }
  ],
  "communicationPreferences": [
    {
      "title": "Communication preference title here",
      "explanation": "Comprehensive explanation including frequency and content type preferences",
      "advisoryHelp": "How high-ticket advisory services can adapt to this preference"
    }
  ]
}

Segment to Analyze:
${segment}`;
    
    console.log('OpenRouter API key exists:', !!process.env.OPENROUTER_API_KEY);
    
    const availableModels = [
      'google/gemini-2.0-flash-001',
      'qwen/qwq-32b',
      'deepseek/deepseek-r1-zero:free'
    ];
    
    let lastError = null;
    
    for (const model of availableModels) {
      try {
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
            messages: [{ role: 'user', content: segmentPrompt }],
            stream: false,
            max_tokens: 25000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error with model ${model} for segment:`, errorText);
          lastError = `API error with model ${model}: ${errorText}`;
          continue;
        }

        const responseData = await response.json();
        const content = responseData.choices[0].message.content;

        try {
          const parsedSegment = cleanAndParseJSON(content);
          console.log(`Successfully parsed segment for model ${model}`);
          return parsedSegment;
        } catch (parseError) {
          console.error(`Error parsing JSON from model ${model}:`, parseError);
          lastError = `JSON parsing error with model ${model}: ${parseError}`;
          continue;
        }
      } catch (error) {
        console.error(`Error with model ${model} for segment:`, error);
        lastError = `Error with model ${model}: ${error}`;
        continue;
      }
    }

    throw new Error(lastError || 'All models failed for this segment');
  });

  try {
    const results = await Promise.all(segmentPromises);
    console.log(`Successfully processed ${results.length} segments`);
    
    return NextResponse.json({ 
      result: {
        segments: results, // Array of parsed JSON objects
        formattedContent: formatDeepResearchForDisplay(results)
      }
    });
  } catch (error) {
    console.error('Error processing segments:', error);
    return NextResponse.json({ 
      error: 'Error processing segments', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
  
} catch (error) {
  console.error('Error in deep-research API:', error);
  return NextResponse.json({ 
    error: 'Failed to do deep research',
    details: error instanceof Error ? error.message : String(error)
  }, { status: 500 });
}
}

function splitSegments(text: string) {
  const segments = text.split(/---/);

  const filteredSegments = segments
    .filter(segment => segment.trim() !== '')
    .map(segment => segment.trim());

  return filteredSegments;
}