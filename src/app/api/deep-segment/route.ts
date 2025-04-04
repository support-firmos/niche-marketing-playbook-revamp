import { NextResponse } from 'next/server';
import { formatDeepResearchForDisplay } from '@/app/utilities/formatDeepResearch';

export const maxDuration = 60;
export const runtime = 'edge';

// Available models
const availableModels = [
  'google/gemini-2.0-flash-001',  // Prioritizing Gemini since it's faster for marketing research
  'openai/gpt-4o-mini',
];

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
    console.log("segments:", segments.length);
    
    const segmentPromises = segments.map(async (segment) => {
      // Process each segment with sequential approach
      return await processSegmentSequentially(segment);
    });

    try {
      const results = await Promise.all(segmentPromises);
      console.log(`Successfully processed ${results.length} segments`);

      return NextResponse.json({ 
        result: {
          segments: results,
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

// Process a segment sequentially in 3 parts
async function processSegmentSequentially(segment: string) {
  // Phase 1: Get the segment name and first two categories
  try {
    console.log(`Processing segment: Part 1/3`);
    
    // First phase - explicitly include name field in the prompt
    const phase1Prompt = `
Your Task - Analyze the segment provided below and generate a comprehensive, detailed and specific market research profile.

Segment to Analyze:
${segment}

For your content, ALWAYS output useful, industry-specific insights over generic descriptions. Be detailed as much as possible. Reflect on real-world examples.

Provide the EXACT segment name and EXACTLY 5 items for each of these categories: fears, pains

After analyzing the segment information above, output your response with a JSON structure EXACTLY like this:
{
"name": "EXACT segment name",
"fears": [
  {
    "title": "Fear title",
    "explanation": "In 3 sentences, write a comprehensive, data-driven, insightful and specific explanation about why and how this fear persists within the particular segment given.\\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this fear taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment deal with or remove this fear. Explain them with detail and industry specifics. In this format:\\n1.\\n2.\\n3."
  }
],
"pains": [
  {
    "title": "Pain point title",
    "explanation": "In 3 sentences, write a comprehensive, data-driven, insightful and specific explanation about why and how this pain point persists within the particular segment given.\\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this pain taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment deal with or remove this pain point. Explain them with detail and industry specifics. In this format:\\n1.\\n2.\\n3."
  }
]
}

CRITICAL REQUIREMENTS:
1. Your response must be ONLY a valid JSON object
2. Do not include any text or code blocks before or after the JSON
3. You must provide EXACTLY 5 items for each category (fears, pains)
4. DO NOT change the segment name from what is given below.
5. Do not include any comments or explanations
6. For your content, ALWAYS output useful, industry-specific insights over generic descriptions. Be detailed as much as possible. Reflect on real-world examples. 
7. Do not include trailing commas
7. Use double quotes for all strings and properly escape any quotes within strings
9. Please provide a valid JSON object without markdown formatting or additional text.
`;

    const phase1Result = await callLLM(phase1Prompt);
    const phase1Data = cleanAndParseJSON(phase1Result);
    
    // Validate that we have the name field
    if (!phase1Data.name) {
      throw new Error("Missing segment name in the first phase response");
    }
    
    // Extract segment name for future phases
    const segmentName = phase1Data.name;
    
    // Phase 2: Get the next three categories
    console.log(`Processing segment "${segmentName}": Part 2/3`);
    const phase2Prompt = `
Your Task - Analyze the segment provided below and generate a comprehensive, detailed and specific market research profile.

Segment to Analyze:
${segment}

For your content, ALWAYS output useful, industry-specific insights over generic descriptions. Be detailed as much as possible. Reflect on real-world examples.

Provide EXACTLY 5 items for each of these categories: objections, goals, values

After analyzing the segment information above, output your response with a JSON structure EXACTLY like this:
{
"objections": [
  {
    "title": "Objection title",
    "explanation": "In 3 sentences, write a comprehensive, data-driven, insightful and specific explanation about why this particular segment raises this objection against availing advisory services.\\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this objection taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 counter-arguments to defend why high-ticket, specific advisory services (with examples and feedback) will improve their firm. Explain them with detail and industry specifics. In this format:\\n1.\\n2.\\n3."
  }
],
"goals": [
  {
    "title": "Goal title",
    "explanation": "In 3 sentences, write a comprehensive, data-driven, insightful and specific explanation about why this goal stands out in this particular segment.\\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this goal taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment achieve this goal. Explain them with detail and industry specifics. In this format:\\n1.\\n2.\\n3."
  }
],
"values": [
  {
    "title": "Value title",
    "explanation": "In 3 sentences, write a comprehensive, data-driven, insightful and specific explanation about how and why this value stands out within the particular segment.\\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this core value taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment maintain and preserve this core value. Explain them with detail and industry specifics. In this format:\\n1.\\n2.\\n3."
  }
]
}

CRITICAL REQUIREMENTS:
1. Your response must be ONLY a valid JSON object
2. Do not include any text or code blocks before or after the JSON
3. You must provide EXACTLY 5 items for each requested category (objections, goals, values)
4. Do not include any comments or explanations
5. For your content, ALWAYS output useful, industry-specific insights over generic descriptions
6. Do not include trailing commas
7. Use double quotes for all strings and properly escape any quotes within strings
8. Please provide a valid JSON object without markdown formatting or additional text
`;
    
    const phase2Result = await callLLM(phase2Prompt);
    const phase2Data = cleanAndParseJSON(phase2Result);
    
    // Phase 3: Get the final three categories
    console.log(`Processing segment "${segmentName}": Part 3/3`);
    const phase3Prompt = `
Your Task - Analyze the segment provided below and generate a comprehensive, detailed and specific market research profile.

Segment to Analyze:
${segment}

For your content, ALWAYS output useful, industry-specific insights over generic descriptions. Be detailed as much as possible. Reflect on real-world examples.

Provide EXACTLY 5 items for each of these categories: decisionMaking, influences, communicationPreferences

After analyzing the segment information above, output your response with a JSON structure EXACTLY like this:
{
"decisionMaking": [
  {
    "title": "Decision-making process title",
    "explanation": "In 3 sentences, write a comprehensive, data-driven, insightful and specific explanation about how and why this decision-making process is can help this particular segment. \\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this decision-making process taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment implement this process. Explain them with detail and industry specifics. In this format:\\n1.\\n2.\\n3."
  }
],
"influences": [
  {
    "title": "Influence title",
    "explanation": "In 3 sentences, write a comprehensive, data-driven, insightful and specific explanation about why this influence is so important for this segment. \\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of the particular segment positively affected by this influence, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that push or alleviate this influence even more. Explain them with detail and industry specifics. In this format:\\n1.\\n2.\\n3."
  }
],
"communicationPreferences": [
  {
    "title": "Communication preference title",
    "explanation": "In 3 sentences, write a comprehensive, data-driven, insightful and specific explanation about how and why this communication preference is common within the segment. \\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this communication preference taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment implement these preferences. Explain them with detail and industry specifics. In this format:\\n1.\\n2.\\n3."
  }
]
}

CRITICAL REQUIREMENTS:
1. Your response must be ONLY a valid JSON object
2. Do not include any text or code blocks before or after the JSON
3. You must provide EXACTLY 5 items for each requested category (decisionMaking, influences, communicationPreferences)
4. Do not include any comments or explanations
5. For your content, ALWAYS output useful, industry-specific insights over generic descriptions
6. Do not include trailing commas
7. Use double quotes for all strings and properly escape any quotes within strings
8. Please provide a valid JSON object without markdown formatting or additional text
`;
    
    const phase3Result = await callLLM(phase3Prompt);
    const phase3Data = cleanAndParseJSON(phase3Result);
    
    // Combine all results
    const fullResult = {
      name: segmentName,
      fears: phase1Data.fears || [],
      pains: phase1Data.pains || [],
      objections: phase2Data.objections || [],
      goals: phase2Data.goals || [],
      values: phase2Data.values || [],
      decisionMaking: phase3Data.decisionMaking || [],
      influences: phase3Data.influences || [],
      communicationPreferences: phase3Data.communicationPreferences || []
    };
    
    // Validate structure
    validateSegmentStructure(fullResult);
    
    console.log(`Completed processing segment "${segmentName}"`);
    return fullResult;
    
  } catch (error) {
    console.error(`Error processing segment sequentially:`, error);
    throw error;
  }
}

// Validate segment structure to ensure it has all required fields
function validateSegmentStructure(segment: any) {
  const requiredCategories = [
    'name', 'fears', 'pains', 'objections', 'goals', 'values', 
    'decisionMaking', 'influences', 'communicationPreferences'
  ];
  
  for (const category of requiredCategories) {
    if (!segment[category]) {
      throw new Error(`Missing required category: ${category}`);
    }
    
    if (category !== 'name' && (!Array.isArray(segment[category]) || segment[category].length !== 5)) {
      throw new Error(`Category ${category} must have exactly 5 items`);
    }
  }
}

// Helper function to call LLM
async function callLLM(prompt: string) {
  let lastError = null;

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
          messages: [
            {
              role: 'system',
              content: 'You are a precision JSON generator that only outputs valid, correctly formatted JSON with no additional text. You are an empathetic B2B Researcher capable of deeply understanding and embodying the Ideal Customer Profile (ICP) for high-ticket advisory and consulting services.'
            },
            { role: 'user', content: prompt }
          ],
          stream: false,
          max_tokens: 8000,  // Reduced from 25000 since we're processing in smaller chunks
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error with model ${model}:`, errorText);
        lastError = `API error with model ${model}: ${errorText}`;
        continue;
      }

      const responseData = await response.json();
      const content = responseData.choices[0].message.content;
      
      // Return the raw content for further processing
      return content;
      
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      lastError = `Error with model ${model}: ${error}`;
      continue;
    }
  }

  throw new Error(lastError || 'All models failed for this request');
}

function splitSegments(text: string) {
  const segments = text.split(/---/);

  const filteredSegments = segments
    .filter(segment => segment.trim() !== '')
    .map(segment => segment.trim());

  return filteredSegments;
}