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
Your Task - Analyze the segment provided below and generate a comprehensive, detailed and specific market research profile.

Segment to Analyze:
${segment}

For your content, ALWAYS output useful, industry-specific insights over generic descriptions. Be detailed as much as possible. Reflect on real-world examples.

Provide EXACTLY 5 items for each category (fears, pains, objections, goals, values, decisionMaking, influences, and communicationPreferences)

After analysis of the segment information above, output your response with a JSON structure exactly like below:

{
"name": "EXACT segment name",
"fears": [
{
"title": "Fear title",
"explanation": " In 4 sentences, write a comprehensive, data-driven, insightful and specific explanation about why and how this fear persists within the particular segment given.",
"scenario: "A real-world scenario of this fear taking place within the particular segment, including its business impact.",
"advisoryHelp":"1. Suggest a high-ticket, specific advisory service to alleviate this fear. Explain it with detail and industry specifics. \\n2. Suggest a high-ticket, specific advisory service to alleviate this fear. Explain it with detail and industry specifics. \\n3. Suggest a high-ticket, specific advisory service to alleviate this fear. Explain it with detail and industry specifics."
}
],
"pains": [
{
"title": "Pain point title",
"explanation": " In 4 sentences, write a comprehensive, data-driven, insightful and specific explanation about why and how this pain point persists within the particular segment given.",
"scenario": "A real-world scenario of this pain taking place within the particular segment, including its business impact.",
"advisoryHelp": "1. Suggest a high-ticket, specific advisory service to alleviate this pain point. Explain it with detail and industry specifics. \\n2. Suggest a high-ticket, specific advisory service to alleviate this pain point. Explain it with detail and industry specifics. \\n3. Suggest a high-ticket, specific advisory service to alleviate this pain point. Explain it with detail and industry specifics."
}
],
"objections": [
{
"title": "Objection title",
"explanation": " In 4 sentences, write a comprehensive, data-driven, insightful and specific explanation about why this particular segment raises this objection against availing advisory services.",
"scenario": "A real-world scenario of this objection taking place within the particular segment, including its business impact.",
"advisoryHelp": "1. Suggest a strong counterargument by providing benefits of high-ticket advisory services with detail, precision, and industry specifics. \\n2. Suggest a strong counterargument by providing benefits of high-ticket advisory services with detail, precision, and industry specifics. \\n3. Suggest a strong counterargument by providing benefits of high-ticket advisory services with detail, precision, and industry specifics."
}
],
"goals": [
{
"title": "Goal title",
"explanation": " In 4 sentences, write a comprehensive, data-driven, insightful and specific explanation about why this goal stands out in this particular segment.",
"scenario": "A real-world scenario of this goal taking place within the particular segment, including its business impact.",
"advisoryHelp": "1. Suggest a high-ticket, specific advisory service that helps the segment attain this goal. Explain it with detail and industry specifics.\\n2. Suggest a high-ticket, specific advisory service that helps the segment attain this goal. Explain it with detail and industry specifics. \\n3. Suggest a high-ticket, specific advisory service that helps the segment attain this goal. Explain it with detail and industry specifics."
}
],
"values": [
{
"title": "Value title",
"explanation": " In 4 sentences, write a comprehensive, data-driven, insightful and specific explanation about how and why this value stands out within the particular segment.",
"scenario": "A real-world scenario of this core value taking place within the particular segment, including its business impact.",
"advisoryHelp": "1. Suggest a high-ticket, specific advisory service that help the segment maintain and preserve this core value. Explain it with detail and industry specifics. \\n2. Suggest a high-ticket, specific advisory service that help the segment maintain and preserve this core value. Explain it with detail and industry specifics. \\n3. Suggest a high-ticket, specific advisory service that help the segment maintain and preserve this core value. Explain it with detail and industry specifics."
}
],
"decisionMaking": [
{
"title": "Decision-making process title",
"explanation": " In 4 sentences, write a comprehensive, data-driven, insightful and specific explanation about how and why this decision-making process is important within this particular segment.",
"scenario": "A real-world scenario of this decision-making process taking place within the particular segment, including its business impact.",
"advisoryHelp": "1. Suggest a high-ticket, specific advisory service that helps the segment maintain or improve this process. Explain it with detail and industry specifics. \\n2. Suggest a high-ticket, specific advisory service that helps the segment maintain or improve this process. Explain it with detail and industry specifics. \\n3. Suggest a high-ticket, specific advisory service that helps the segment maintain or improve this process. Explain it with detail and industry specifics."
}
],
"influences": [
{
"title": "Influence title",
"explanation": " In 4 sentences, write a comprehensive, data-driven, insightful and specific explanation about why this influence is so important for this segment.",
"scenario": "A real-world scenario of the particular segment positively affected by this influence, including its business impact.",
"advisoryHelp": "1. Suggest a high-ticket, specific advisory service that helps the influence preserve its effect on the particular segment. Explain it with detail and industry specifics. \\n2. Suggest a high-ticket, specific advisory service that helps the influence preserve its effect on the particular segment. Explain it with detail and industry specifics. \\n3. Suggest a high-ticket, specific advisory service that helps the influence preserve its effect on the particular segment. Explain it with detail and industry specifics."
}
],
"communicationPreferences": [
{
"title": "Communication preference title",
"explanation": " In 4 sentences, write a comprehensive, data-driven, insightful and specific explanation about how and why this communication preference is common within the segment.",
"scenario": "A real-world scenario of this communication preference taking place within the particular segment, including its business impact.",
"advisoryHelp": "1. Suggest a high-ticket, specific advisory service that helps this communication preference more seamless and effective for the segment. Explain it with detail and industry specifics. \\n2. Suggest a high-ticket, specific advisory service that helps this communication preference more seamless and effective for the segment. Explain it with detail and industry specifics. \\n3. Suggest a high-ticket, specific advisory service that helps this communication preference more seamless and effective for the segment. Explain it with detail and industry specifics."
}
]
}

CRITICAL REQUIREMENTS:
1. Your response must be ONLY a valid JSON object
2. Do not include any text or code blocks before or after the JSON
3. You must provide EXACTLY 5 items for each category (fears, pains, objections, goals, values, decisionMaking, influences, and communicationPreferences)
4. DO NOT change the segment name from what is given below.
5. Do not include any comments or explanations
6. For your content, ALWAYS output useful, industry-specific insights over generic descriptions. Be detailed as much as possible. Reflect on real-world examples. 
7. Do not include trailing commas
7. Use double quotes for all strings and properly escape any quotes within strings
9. Please provide a valid JSON object without markdown formatting or additional text.
`;
console.log('OpenRouter API key exists:', !!process.env.OPENROUTER_API_KEY);
    
const availableModels = [
  'openai/gpt-4o-mini',
  'google/gemini-2.0-flash-001',
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
        messages: [
          {
            role: 'system',
            content: 'You are a precision JSON generator that only outputs valid, correctly formatted JSON with no additional text. You are an empathetic B2B Researcher capable of deeply understanding and embodying the Ideal Customer Profile (ICP) for high-ticket advisory and consulting services.'
          },
          { role: 'user', content: segmentPrompt }
        ],
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