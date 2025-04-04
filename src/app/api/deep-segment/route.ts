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

interface AdvisoryItem {
  title: string;
  explanation: string;
  scenario: string;
  advisoryHelp: string;
}

interface SegmentStructure {
  name: string;
  fears: AdvisoryItem[];
  pains: AdvisoryItem[];
  objections: AdvisoryItem[];
  goals: AdvisoryItem[];
  values: AdvisoryItem[];
  decisionMaking: AdvisoryItem[];
  influences: AdvisoryItem[];
  communicationPreferences: AdvisoryItem[];
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
    
    // Process segments in parallel with a limit to avoid overwhelming the API
    // This helps stay within Vercel's timeout limits
    const MAX_CONCURRENT_SEGMENTS = 2; // Limit concurrent processing
    const results = [];
    
    // Process segments in batches to avoid timeout
    for (let i = 0; i < segments.length; i += MAX_CONCURRENT_SEGMENTS) {
      const batch = segments.slice(i, i + MAX_CONCURRENT_SEGMENTS);
      const batchPromises = batch.map(segment => processSegmentSequentially(segment));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        console.log(`Processed batch ${i / MAX_CONCURRENT_SEGMENTS + 1} of ${Math.ceil(segments.length / MAX_CONCURRENT_SEGMENTS)}`);
      } catch (error) {
        console.error(`Error processing batch ${i / MAX_CONCURRENT_SEGMENTS + 1}:`, error);
        // Continue with other batches even if one fails
      }
    }

    console.log(`Successfully processed ${results.length} segments`);

    return NextResponse.json({ 
      result: {
        segments: results,
        formattedContent: formatDeepResearchForDisplay(results)
      }
    });
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

Guide questions for fear's 5 items:
1. What keeps your ideal customer up at night regarding their business?
2. What are the worst-case scenarios they imagine could happen to their company?
3. How do they perceive potential threats to their job security or business stability?
4. What industry changes or market trends do they fear the most?
5. How do they feel about the possibility of making a wrong decision in their role?

Guide questions for pain's 5 items:
1. What are the biggest daily frustrations your ideal customer experiences in their role?
2. What tasks or processes do they find most time-consuming or inefficient?
3. How do they describe their main challenges when talking to peers or colleagues?
4. What negative experiences have they had with similar products or services in the past?
5. How do their current problems affect their ability to achieve their business goals?

After analyzing the segment information above, output your response with a JSON structure EXACTLY like this:
{
"name": "EXACT segment name",
"fears": [
  {
    "title": "Fear title",
    "explanation": "In 2 sentences, write a comprehensive, data-driven, insightful and specific explanation about why and how this fear persists within the particular segment given.\\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this fear taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 2 high-ticket, specific advisory services that help the segment deal with or remove this fear. Explain them with detail and industry specifics in 1 sentence. In this format:\\n1.\\n2.\\n3."
  }
],
"pains": [
  {
    "title": "Pain point title",
    "explanation": "In 2 sentences, write a comprehensive, data-driven, insightful and specific explanation about why and how this pain point persists within the particular segment given.\\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this pain taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment deal with or remove this pain point. Explain them with detail and industry specifics in 1 sentence. In this format:\\n1.\\n2.\\n3."
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

    // Add timeout handling for each phase
    let phase1Data;
    try {
      const phase1Result = await callLLM(phase1Prompt);
      phase1Data = cleanAndParseJSON(phase1Result);
    } catch (error) {
      console.error(`Error in phase 1:`, error);
      // Provide fallback data if phase 1 fails
      phase1Data = {
        name: segment.split('\n')[0].trim(), // Use first line as segment name
        fears: Array(5).fill({
          title: "Fear placeholder",
          explanation: "Explanation placeholder",
          scenario: "Scenario placeholder",
          advisoryHelp: "Advisory help placeholder"
        }),
        pains: Array(5).fill({
          title: "Pain placeholder",
          explanation: "Explanation placeholder",
          scenario: "Scenario placeholder",
          advisoryHelp: "Advisory help placeholder"
        })
      };
    }
    
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

Guide questions for objection's 5 items:
1. What are the primary reasons your ideal customer might be skeptical about your product or service?
2. How do they evaluate the risks versus the benefits of adopting a new solution?
3. What previous experiences with other providers might make them wary of trying your solution?
4. What financial or budgetary concerns do they have regarding your offering?
5. How do they perceive the difficulty of integrating your product or service into their existing workflows?

Guide questions for goal's 5 items:
1. What are the top three goals your ideal customer aims to achieve in the next year?
2. How do they measure success in their role or business?
3. What long-term visions or ambitions do they have for their company?
4. What are the immediate milestones they are working towards?
5. How do they prioritize their goals in the context of their daily responsibilities?

Guide questions for values' 5 items:
1. What ethical considerations are most important to your ideal customer when choosing a provider?
2. How do they define quality and value in a product or service?
3. What company culture aspects do they value in their own organization?
4. How do they prefer to build relationships with vendors and partners?
5. What do they value most in their business relationships (e.g., transparency, reliability, innovation)?

After analyzing the segment information above, output your response with a JSON structure EXACTLY like this:
{
"objections": [
  {
    "title": "Objection title",
    "explanation": "In 2 sentences, write a comprehensive, data-driven, insightful and specific explanation about why this particular segment raises this objection against availing advisory services.\\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this objection taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 counter-arguments to defend why high-ticket, specific advisory services (with examples and feedback) will improve their firm. Explain them with detail and industry specifics in 1 sentence. In this format:\\n1.\\n2.\\n3."
  }
],
"goals": [
  {
    "title": "Goal title",
    "explanation": "In 2 sentences, write a comprehensive, data-driven, insightful and specific explanation about why this goal stands out in this particular segment.\\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this goal taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment achieve this goal. Explain them with detail and industry specifics in 1 sentence. In this format:\\n1.\\n2.\\n3."
  }
],
"values": [
  {
    "title": "Value title",
    "explanation": "In 2 sentences, write a comprehensive, data-driven, insightful and specific explanation about how and why this value stands out within the particular segment.\\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this core value taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment maintain and preserve this core value. Explain them with detail and industry specifics in 1 sentence. In this format:\\n1.\\n2.\\n3."
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
    
    // Add timeout handling for phase 2
    let phase2Data;
    try {
      const phase2Result = await callLLM(phase2Prompt);
      phase2Data = cleanAndParseJSON(phase2Result);
    } catch (error) {
      console.error(`Error in phase 2:`, error);
      // Provide fallback data if phase 2 fails
      phase2Data = {
        objections: Array(5).fill({
          title: "Objection placeholder",
          explanation: "Explanation placeholder",
          scenario: "Scenario placeholder",
          advisoryHelp: "Advisory help placeholder"
        }),
        goals: Array(5).fill({
          title: "Goal placeholder",
          explanation: "Explanation placeholder",
          scenario: "Scenario placeholder",
          advisoryHelp: "Advisory help placeholder"
        }),
        values: Array(5).fill({
          title: "Value placeholder",
          explanation: "Explanation placeholder",
          scenario: "Scenario placeholder",
          advisoryHelp: "Advisory help placeholder"
        })
      };
    }
    
    // Phase 3: Get the final three categories
    console.log(`Processing segment "${segmentName}": Part 3/3`);
    const phase3Prompt = `
Your Task - Analyze the segment provided below and generate a comprehensive, detailed and specific market research profile.

Segment to Analyze:
${segment}

For your content, ALWAYS output useful, industry-specific insights over generic descriptions. Be detailed as much as possible. Reflect on real-world examples.

Provide EXACTLY 5 items for each of these categories: decisionMaking, influences, communicationPreferences

Guide questions for decisionMaking' 5 items:
1. What steps do they typically follow when evaluating a new product or service?
2. Who else is involved in the decision-making process within their company?
3. What criteria are most important to them when selecting a solution?
4. How do they gather and assess information before making a decision?
5. What external resources (reviews, testimonials, case studies) do they rely on during the decision-making process?

Guide questions for influences' 5 items:
1. Who are the thought leaders or industry experts your ideal customer trusts the most?
2. What publications, blogs, or websites do they frequently read for industry news and insights?
3. How do they engage with their professional network to seek advice or recommendations?
4. What role do customer reviews and testimonials play in their purchasing decisions?
5. How do industry events, conferences, and webinars influence their perceptions and decisions?

Guide questions for communicationPreferences' 5 items:
1. What communication channels do they use most frequently (email, social media, phone, etc.)?
2. How do they prefer to receive information about new products or services?
3. What type of content (articles, videos, infographics) do they find most engaging and useful?
4. How often do they like to be contacted by potential vendors?
5. What tone and style of communication do they respond to best (formal, casual, informative, etc.)?

After analyzing the segment information above, output your response with a JSON structure EXACTLY like this:
{
"decisionMaking": [
  {
    "title": "Decision-making process title",
    "explanation": "In 2 sentences, write a comprehensive, data-driven, insightful and specific explanation about how and why this decision-making process is can help this particular segment. \\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this decision-making process taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment implement this process. Explain them with detail and industry specifics in 1 sentence. In this format:\\n1.\\n2.\\n3."
  }
],
"influences": [
  {
    "title": "Influence title",
    "explanation": "In 2 sentences, write a comprehensive, data-driven, insightful and specific explanation about why this influence is so important for this segment. \\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of the particular segment positively affected by this influence, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that push or alleviate this influence even more. Explain them with detail and industry specifics in 1 sentence. In this format:\\n1.\\n2.\\n3."
  }
],
"communicationPreferences": [
  {
    "title": "Communication preference title",
    "explanation": "In 2 sentences, write a comprehensive, data-driven, insightful and specific explanation about how and why this communication preference is common within the segment. \\n• Data-driven insight to support paragraph above\\n• Data-driven insight to support paragraph above",
    "scenario": "A real-world scenario of this communication preference taking place within the particular segment, including its business impact.",
    "advisoryHelp": "Suggest 3 high-ticket, specific advisory services that help the segment implement these preferences. Explain them with detail and industry specifics in 1 sentence. In this format:\\n1.\\n2.\\n3."
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
    
    // Add timeout handling for phase 3
    let phase3Data;
    try {
      const phase3Result = await callLLM(phase3Prompt);
      phase3Data = cleanAndParseJSON(phase3Result);
    } catch (error) {
      console.error(`Error in phase 3:`, error);
      // Provide fallback data if phase 3 fails
      phase3Data = {
        decisionMaking: Array(5).fill({
          title: "Decision-making placeholder",
          explanation: "Explanation placeholder",
          scenario: "Scenario placeholder",
          advisoryHelp: "Advisory help placeholder"
        }),
        influences: Array(5).fill({
          title: "Influence placeholder",
          explanation: "Explanation placeholder",
          scenario: "Scenario placeholder",
          advisoryHelp: "Advisory help placeholder"
        }),
        communicationPreferences: Array(5).fill({
          title: "Communication preference placeholder",
          explanation: "Explanation placeholder",
          scenario: "Scenario placeholder",
          advisoryHelp: "Advisory help placeholder"
        })
      };
    }
    
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
function validateSegmentStructure(segment: SegmentStructure) {
  // Check if name exists
  if (!segment.name) {
    throw new Error(`Missing required category: name`);
  }
  
  // Check array categories
  const arrayCategories: (keyof SegmentStructure)[] = [
    'fears', 'pains', 'objections', 'goals', 'values', 
    'decisionMaking', 'influences', 'communicationPreferences'
  ];
  
  for (const category of arrayCategories) {
    if (!segment[category]) {
      throw new Error(`Missing required category: ${category}`);
    }
    
    if (!Array.isArray(segment[category]) || segment[category].length !== 5) {
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
      
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
      
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
          stream: true, // Enable streaming
          max_tokens: 8000,
          temperature: 0.7,
        }),
        signal: controller.signal, // Add the abort signal
      });

      // Clear the timeout since the request completed
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error with model ${model}:`, errorText);
        lastError = `API error with model ${model}: ${errorText}`;
        continue;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader from response');
      }

      let content = '';
      const decoder = new TextDecoder();
      
      // Set a timeout for the entire streaming process
      const streamingTimeoutId = setTimeout(() => {
        reader.cancel('Streaming timeout reached');
      }, 25000); // 25 second timeout for streaming

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk and add it to our content
          const chunk = decoder.decode(value, { stream: true });
          
          // Process the chunk to extract the content
          // OpenRouter streaming format: data: {"id":"...","object":"chat.completion.chunk","created":...,"model":"...","choices":[{"index":0,"delta":{"content":"..."},"finish_reason":null}]}
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.substring(6));
                if (jsonData.choices && jsonData.choices[0]?.delta?.content) {
                  content += jsonData.choices[0].delta.content;
                }
              } catch (e) {
                // Skip invalid JSON lines
                console.log('Skipping invalid JSON line:', e);
              }
            }
          }
        }
      } finally {
        // Clear the streaming timeout
        clearTimeout(streamingTimeoutId);
      }
      
      // Return the complete content
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