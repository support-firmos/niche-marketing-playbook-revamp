// src/app/api/sales-nav/route.ts
import { NextResponse } from 'next/server';
import { formatSegmentsForDisplay } from '@/app/utilities/formatSegments';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Edge runtime for better performance with long-running requests
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { 
      nicheConsideration, 
      segments,
      profitability, 
      experience, 
      clientPercentage, 
      successStories, 
      teamSize,
      selectedServices 
    } = requestData;

    if (!profitability ||!experience || !clientPercentage || !successStories ||!teamSize ||!selectedServices) {
      console.error('Information lacking');
      return NextResponse.json({ error: 'Information lacking' }, { status: 400 });
    }
  
    const hasValidSegments = (segments?: string) => {
      if (!segments) return false;
      const normalizedSegments = segments.trim().toLowerCase();
      return normalizedSegments !== '' && 
             normalizedSegments !== 'no' && 
             normalizedSegments !== 'none';
    };

    // Extract a brief niche summary for the header
    const nicheShortSummary = nicheConsideration.split('\n')[0].trim();
  
    // Modified section of the prompt in src/app/api/generate-segments/route.ts
    const prompt = `
## Accounting Advisory Services - Market Fit & Segment Research for ${nicheShortSummary}
    
### Introduction & Context

Accountants often undervalue their services by treating them as mere "compliance" work (e.g., tax returns, basic bookkeeping). However, these same professionals can (and should) offer **high-ticket recurring services** such as advisory, consulting, or niche-specific guidance. This prompt helps identify the most profitable segments within the niche where accounting professionals can provide high-value, consultative offerings that solve deeper client pain points and justify higher pricing.

---

### Task

This is the target niche/industry: ${nicheConsideration}

These are the services that the client wants to avail: ${selectedServices}

${hasValidSegments(segments) ? `
IMPORTANT: The following segments MUST be included and prioritized in your analysis (if they align with the criteria):
${segments}
` : ''}

Determine 5-7 specific segments within that niche that aligns to the list of services that the client wants to avail, and a the same time are fit for high-ticket, recurring accounting advisory services.

###CRITERIA FOR SEGMENTS (ranked, so criteria #1 must be the first priority in consideration)

${hasValidSegments(segments) ? `
  CRITERIA #0 (HIGHEST PRIORITY): If any of these segments were provided, they MUST be included in the final list (assuming they meet the other criteria):
  ${segments}
  ` : ''}
CRITERIA #1: Strictly, the segments, and the services for each each segment, must align and/or be connected to any of the services that the client wants
            to avail (${selectedServices}).
CRITERIA #2: Getting to know the offerer:
          - The size of the offerer's team is ${teamSize}. The advisories/services for each segment you are about to generate is something
            we will consider to offer as a paid service to the client. Make sure that these segments is feasible and attainable
            for that number of members in this team.
          - Here are the 4 credibilities of the offerer:
            -> Success stories: ${successStories}
            -> Percent of current clients I have under this niche: ${clientPercentage}
            -> My background of this niche: ${experience}
            -> Profitability of my clients under this niche: ${profitability}
CRITERIA #3: These segments must meet the following criteria:
            **Financial Viability**: $5M–$150M annual revenue (can afford $15K–$30K/month retainers)
            **Recurring Need Justification**: Requires ongoing financial strategy, not one-time services
            **Accessibility**: Decision-makers reachable via LinkedIn/email/phone
            **Service Fit**: Needs budgeting, cash flow management, KPI tracking, or financial advisory
CRITERIA #4: When identifying the best segments, prioritize:
          - Complex financial operations requiring ongoing expertise
          - Regulatory or compliance challenges specific to the niche
          - Growth-stage companies needing financial strategy but not ready for full-time financial leadership
          - Businesses with potential for value-based pricing of advisory services

Present 5-7 well-researched market segments (niches), ranked from highest to lowest potential profitability. Use the following visual format with markdown formatting:

---

You are also a specialized LinkedIn Sales Navigator outreach strategist with deep expertise in B2B targeting and account-based marketing. Your task is to transform the each segment given above into a structured LinkedIn Sales Navigator targeting strategy for fractional CFO services.

FORMAT YOUR RESPONSE AS A JSON ARRAY OF OBJECTS, where each object represents a segment with 10 attributes:
[
{
"name": "segment name here",
"justification":
"
• Dicuss how this segment is aligned, reflected or connected to any of the services the client wants to avail (${selectedServices}).  
• Explain specific need for recurring financial leadership
• Briefly discuss this service' achievability by reflecting it to the offerer's credibilities above (success stories, current clients, background,  profitability).
• Briefly discuss why and how a team with ${teamSize} members can achieve this service
",
"challenges" :
"
• Challenge 1 — Detailed explanation of the challenge with specific examples and business implications
• Challenge 2 — Detailed explanation of the challenge with specific examples and business implications
• Challenge 3 — Detailed explanation of the challenge with specific examples and business implications
• Challenge 4 — Detailed explanation of the challenge with specific examples and business implications
",
"jobtitles" :
 "
[List in bullet points 20-30 non-finance *job titles* (italicized), one per line, focusing on business owners, executives, and operational leadership who would make decisions about hiring financial services. Include multiple variants of similar roles (Owner, Co-Owner, Founder, Co-Founder, etc.)]
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
",
"industries" :
"
[List in bullet points 3-5 industry categories]
",
"headcount" :
"
[(In bullet points) Specify employee range using LinkedIn's standard brackets: 11-50, 51-200, 201-500, etc.]
",
"companytype" :
"
[List in bullet points company types]
",
"keywords" :
"
[List in bullet points relevant keywords in quotation marks]
",
"boolean" :
"
[Provide a sample boolean search string using OR operators]
",
"intentdata" :
"
• [Signal 1] (Detailed explanation with specific business implications)
• [Signal 2] (Detailed explanation with specific business implications)
• [Signal 3] (Detailed explanation with specific business implications)
• [Signal 4] (Detailed explanation with specific business implications)
",
},
{...same format above for the next segments}
]

IMPORTANT INSTRUCTIONS:
- Format your ENTIRE response as a valid JSON array that can be parsed with JSON.parse()
- Do NOT include any text before or after the JSON
- Please provide a valid JSON response without markdown formatting or additional text.
- Maintain the exact structure shown above
- Do NOT include any introductory text, disclaimers, or conclusions
- Start immediately with the first segment name
- Extract and transform information from the provided segment analysis
- Focus on creating practical Sales Navigator targeting parameters
- For Job Titles: Do NOT include finance roles (CFO, Finance Director, Controller, etc.) since these positions would NOT hire fractional CFO services. Instead, focus on business leaders/owners who would make these decisions.
- Include a diverse range of job title variants to maximize the total addressable market
- Provide in-depth, detailed explanations for "Why This Segment?" and "Key Challenges" sections
- End after completing the last segment with no closing remarks
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
                content: prompt 
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
    const result = responseData.choices[0].message.content;

    let parsedSegments = [];
    
    try {

      // Try to parse the JSON response
      parsedSegments = JSON.parse(result.replace(/```json|```/g, '').trim());
      console.log(`Successfully parsed ${parsedSegments.length} segments from response`);
    } catch (error) {
      console.error('Error parsing segments JSON:', error);
      console.log('Raw content:', result.substring(0, 500) + '...');
    }
    
    // Format the segments into readable text format
    const formattedContent = formatSegmentsForDisplay(parsedSegments);
    
    return NextResponse.json({ 
      result: {
        result,
        formattedContent, // Add the formatted content for frontend display
        segments: parsedSegments
      }
    });
  } catch (error) {
    console.error('Error generating segments:', error);
    return NextResponse.json({ error: 'Failed to generate segments' }, { status: 500 });
  }
}