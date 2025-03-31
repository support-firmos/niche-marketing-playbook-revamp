
import { NextResponse } from 'next/server';
import { formatDeepResearchForDisplay } from '@/app/utilities/formatDeepResearch';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Edge runtime for better performance with long-running requests
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    console.log('Generate-segments API called');
    
    const requestData = await request.json();
    const { content } = requestData;
    
    if (!content) {
      console.error('content lacking');
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    // Split the content into segments
    const segments = splitSegments(content);
    
    // Process each segment in parallel
    const segmentPromises = segments.map(async (segment) => {
      const segmentPrompt = `
 You are an empathetic B2B Researcher capable of deeply understanding and embodying the Ideal Customer Profile (ICP) for high-ticket advisory and consulting services.

## Your Task
Analyze the ICP provided below and generate a comprehensive market research profile for the segment following the exact structure below. Use the information to identify the most relevant and impactful insights.
Provide exactly 5 items per category. There is a guide below to help you write each item.

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT with the following structure:
{
  "name": "segment name here",
  "fears": [
    {
      "title": "Fear title here",
      "explanation": "Comprehensive explanation of the fear including real-world business impact",
      "advisoryHelp": "How high-ticket advisory services address this fear"
    }
    // ... 4 more fears following the same structure
  ],
  "pains": [
    {
      "title": "Pain point title here",
      "explanation": "Comprehensive explanation of the pain including negative consequences",
      "advisoryHelp": "How high-ticket advisory services address this pain point"
    }
    // ... 4 more pains following the same structure
  ],
  "objections": [
    {
      "title": "Objection title here",
      "explanation": "Comprehensive explanation of the objection including client concerns",
      "advisoryHelp": "How to counter with benefits of high-ticket advisory services"
    }
    // ... 4 more objections following the same structure
  ],
  "goals": [
    {
      "title": "Goal title here",
      "explanation": "Comprehensive explanation of the goal including desired outcomes",
      "advisoryHelp": "How high-ticket advisory services help attain this goal"
    }
    // ... 4 more goals following the same structure
  ],
  "values": [
    {
      "title": "Value title here",
      "explanation": "Comprehensive explanation of the value including impact on decision-making",
      "advisoryHelp": "How high-ticket advisory services align with this value"
    }
    // ... 4 more values following the same structure
  ],
  "decisionMaking": [
    {
      "title": "Decision-making process title here",
      "explanation": "Comprehensive explanation including stakeholders and timeframes",
      "advisoryHelp": "How high-ticket advisory services fit into this process"
    }
    // ... 4 more decision-making processes following the same structure
  ],
  "influences": [
    {
      "title": "Influence title here",
      "explanation": "Comprehensive explanation of the influence including how it shapes perceptions",
      "advisoryHelp": "How high-ticket advisory services can leverage this influence"
    }
    // ... 4 more influences following the same structure
  ],
  "communicationPreferences": [
    {
      "title": "Communication preference title here",
      "explanation": "Comprehensive explanation including frequency and content type preferences",
      "advisoryHelp": "How high-ticket advisory services can adapt to this preference"
    }
    // ... 4 more communication preferences following the same structure
  ]
}

IMPORTANT INSTRUCTIONS:
- Format your ENTIRE response as a valid JSON object that can be parsed with JSON.parse()
- Do NOT include any text before or after the JSON
- Provide exactly 5 items for each category
- Each explanation and advisoryHelp should be detailed and comprehensive
- Focus on practical, actionable insights
- Ensure all advisoryHelp sections align with the services the client wants to provide

Segment to Analyze:
${segment}`;
    
    console.log('OpenRouter API key exists:', !!process.env.OPENROUTER_API_KEY);
    
    const availableModels = [
      'google/gemini-2.0-flash-001',
      'qwen/qwq-32b',
      'deepseek/deepseek-r1-zero:free'
    ];
    
    let lastError = null;
    
    // Try each model for this segment
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
          // Parse the JSON response and return it
          const parsedSegment = JSON.parse(content.replace(/```json|```/g, '').trim());
          console.log(`Successfully parsed segment for model ${model}`);
          return parsedSegment; // Return the parsed segment data
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

    // If we get here, all models failed for this segment
    throw new Error(lastError || 'All models failed for this segment');
  });

  // Wait for all segments to be processed
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