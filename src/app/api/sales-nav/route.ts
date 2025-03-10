// src/app/api/sales-nav/route.ts
import { NextResponse } from 'next/server';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Edge runtime for better performance with long-running requests
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { niche, segments } = requestData;
    
    if (!segments || typeof segments !== 'string') {
      return NextResponse.json({ error: 'Invalid segment information' }, { status: 400 });
    }
    
    // Add niche context if available
    const nicheContext = niche ? `Niche context: ${niche}` : '';
    
    // Modified section of the prompt in src/app/api/generate-segments/route.ts
    const prompt = `
    You are a specialized LinkedIn Sales Navigator outreach strategist with deep expertise in B2B targeting and account-based marketing. Your task is to transform the segment information below into a structured LinkedIn Sales Navigator targeting strategy for fractional CFO services.

    ${nicheContext}

    FORMAT YOUR RESPONSE AS A JSON ARRAY OF OBJECTS, where each object represents a segment with two attributes, namely name and content:
    [
      {
        "name": "segment name here",
        "content":
          "
            Why This Segment?
            [3-5 sentences explaining why this segment needs fractional CFO services. Provide specific business context, industry challenges, and financial pain points. Detail how their size, growth stage, and business model create a need for sophisticated financial leadership without the cost of a full-time CFO. Explain their complexity and why they're particularly suited for fractional services.]
        
            Key Challenges:
            👉 [Challenge 1]—[Detailed explanation of the challenge with specific examples and business implications]
            👉 [Challenge 2]—[Detailed explanation of the challenge with specific examples and business implications]
            👉 [Challenge 3]—[Detailed explanation of the challenge with specific examples and business implications]
            👉 [Challenge 4]—[Detailed explanation of the challenge with specific examples and business implications]
        
            🎯 Sales Navigator Filters:
            ✅ Job Titles (Business Decision-Makers & Leaders):
            [List 20-30 non-finance job titles, one per line, focusing on business owners, executives, and operational leadership who would make decisions about hiring financial services. Include multiple variants of similar roles (Owner, Co-Owner, Founder, Co-Founder, etc.)]
            Examples:
            Owner
            Co-Owner
            Founder
            Co-Founder
            CEO
            President
            Managing Director
            Managing Partner
            Partner
            Director
            Executive Director
            Chief Operating Officer
            COO
            VP of Operations
            General Manager
                
            ✅ Industry:
            [List 3-5 industry categories, one per line]
                
            ✅ Company Headcount:
            [Specify employee range using LinkedIn's standard brackets: 11-50, 51-200, 201-500, etc.]
                
            ✅ Company Type:
            [List company types, one per line]
                
            ✅ Keywords in Company Name:
            [List relevant keywords in quotation marks]
                
            ✅ Boolean Search Query:
            [Provide a sample boolean search string using OR operators]
                
            Best Intent Data Signals
            🔹 [Signal 1] (Detailed explanation with specific business implications)
            🔹 [Signal 2] (Detailed explanation with specific business implications)
            🔹 [Signal 3] (Detailed explanation with specific business implications)
            🔹 [Signal 4] (Detailed explanation with specific business implications)
          "
      },
      {...same format above for the next segments}
    ]

    IMPORTANT INSTRUCTIONS:
    - Format your ENTIRE response as a valid JSON array that can be parsed with JSON.parse()
    - Do NOT include any text before or after the JSON
    - Please provide a valid JSON response without markdown formatting or additional text.
    - Maintain the exact structure shown above
    - Use the exact emoji formatting shown above (1️⃣, 👉, 🎯, ✅, 🔹)
    - Do NOT include any introductory text, disclaimers, or conclusions
    - Start immediately with "1️⃣" and the first segment name
    - Extract and transform information from the provided segment analysis
    - Focus on creating practical Sales Navigator targeting parameters
    - For Job Titles: Do NOT include finance roles (CFO, Finance Director, Controller, etc.) since these positions would NOT hire fractional CFO services. Instead, focus on business leaders/owners who would make these decisions.
    - Include a diverse range of job title variants to maximize the total addressable market
    - Provide in-depth, detailed explanations for "Why This Segment?" and "Key Challenges" sections
    - End after completing the last segment with no closing remarks

    ${segments.substring(0, 20000)}
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
        console.log(`Trying model: ${model} for sales nav generation`);
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
                role: 'user', 
                content: `Here are the market segments to create LinkedIn Sales Navigator targeting strategies for:\n\n${segments}\n\n${prompt}` 
              }
            ],
            stream: false,
            max_tokens: 25000,
            temperature: 0.7,
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
    
    console.log('Sales Navigator API response received');
    
    // Extract the content from the response
    const content = responseData.choices[0].message.content;
    let parsedSegments = [];
    
    try {
      // Try to parse the JSON response
      parsedSegments = JSON.parse(content.replace(/```json|```/g, '').trim());
      console.log(`Successfully parsed ${parsedSegments.length} segments from response`);
    } catch (error) {
      console.error('Error parsing segments JSON:', error);
      console.log('Raw content:', content.substring(0, 500) + '...');
    }
    
    return NextResponse.json({ 
      result: {
        content,
        segments: parsedSegments
      }
    });
  } catch (error) {
    console.error('Error generating segments:', error);
    return NextResponse.json({ error: 'Failed to generate segments' }, { status: 500 });
  }
}