// src/app/api/playbook/route.ts
import { NextResponse } from 'next/server';

// Set maximum duration to 60 seconds
export const maxDuration = 300;

// Use Edge runtime for better performance with long-running requests
export const runtime = 'edge';

// Define an interface for segment research
interface SegmentResearch {
  name?: string;
  deepResearch?: string;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    let segmentData;
    const services = requestData.services;
    // Handle different input formats
    if (requestData.segmentInfo) {
      if (typeof requestData.segmentInfo === 'string') {
        segmentData = requestData.segmentInfo;
      } else if (typeof requestData.segmentInfo === 'object') {
        // If it's the formatted deep segment research object
        if (requestData.segmentInfo.originalContent) {
          if (requestData.segmentInfo.originalContent.allSegments) {
            // Extract and process all segments
            const segments = requestData.segmentInfo.originalContent.allSegments;
            console.log(`Processing ${segments.length} segments for playbook`);
            segmentData = segments.map((segment: SegmentResearch, index: number) => {
              return `
===== SEGMENT ${index + 1}: ${segment.name || 'Unnamed Segment'} =====

${segment.deepResearch || 'No deep research available for this segment'}
              `;
            }).join('\n\n');
          } else if (requestData.segmentInfo.originalContent.combinedResearch) {
            // Use the combined research if available
            segmentData = requestData.segmentInfo.originalContent.combinedResearch;
          } else {
            // Fallback to the displayContent
            segmentData = requestData.segmentInfo.displayContent || JSON.stringify(requestData.segmentInfo, null, 2);
          }
        } else {
          // Try to stringify the object
          segmentData = JSON.stringify(requestData.segmentInfo, null, 2);
        }
      }
    } else {
      return NextResponse.json({ error: 'No segment information provided' }, { status: 400 });
    }
    
    console.log('Segment data prepared for playbook generation');
    
    const prompt = `You are an expert AI copywriter tasked with creating a single, cohesive marketing playbook for high-ticket advisory and accounting services that incorporates insights from ALL market segments provided. Your goal is to create a unified playbook.

## Your Task
Create a comprehensive, integrated marketing playbook that synthesizes insights from all segment research into a unified strategy. Find the common themes, patterns, and synergies to develop an overarching approach that works across all segments while acknowledging important variations.
Please, highly contextualize (if applicable) your responses based on the services that the client wants to avail: ${services}

## Format Requirements - FOLLOW THESE EXACTLY
- Begin with a compelling title that references specific industry segments covered in your playbook (e.g., "Inbound Marketing Blueprint for Property Management, Development & Brokerage Services")
- Use exactly 5 points for each section
- Each point must be a SINGLE PARAGRAPH (not multiple paragraphs)
- Each point must be substantive and detailed (4-6 sentences minimum)
- Follow markdown formatting
- Begin directly with the title and first section (no narrative introduction)

## Marketing Playbook Structure
Your playbook MUST follow this EXACT structure and format:

#[COMPELLING TITLE THAT REFERENCES SPECIFIC INDUSTRY SEGMENTS]

## AUDIENCE APPROACH

1. [First detailed point as a single paragraph with 4-6 sentences]
2. [Second detailed point as a single paragraph with 4-6 sentences]
3. [Third detailed point as a single paragraph with 4-6 sentences]
4. [Fourth detailed point as a single paragraph with 4-6 sentences]
5. [Fifth detailed point as a single paragraph with 4-6 sentences]

---\n\n

## UNIVERSAL PAIN POINTS

1. [First detailed point as a single paragraph with 4-6 sentences]
2. [Second detailed point as a single paragraph with 4-6 sentences]
3. [Third detailed point as a single paragraph with 4-6 sentences]
4. [Fourth detailed point as a single paragraph with 4-6 sentences]
5. [Fifth detailed point as a single paragraph with 4-6 sentences]

---\n\n

[CONTINUE THIS EXACT FORMAT FOR ALL REMAINING SECTIONS]

## Marketing Playbook Sections
For each section below, provide EXACTLY 5 points that offer concrete, specific insights drawing from ALL segments in the research:

1. UNIFIED AUDIENCE APPROACH
[Provide 5 detailed points. Create a unified approach to targeting all audience segments. Identify common characteristics, overlapping needs, and shared decision patterns. Focus on creating a single messaging framework that resonates across all identified segments.]
2. UNIVERSAL PAIN POINTS
[Provide 5 detailed points. Extract the most significant pain points that appear across multiple segments. Focus on those that represent common ground and create a unified approach to addressing them through advisory and accounting services.]
3. INTEGRATED FEAR MITIGATION
[Provide 5 detailed points. Develop a comprehensive approach to addressing fears and concerns across all segments. Create unified messaging that addresses these fears, acknowledging variations while focusing on common solutions.]
4. UNIVERSAL GOALS AND ASPIRATIONS
[Provide 5 detailed points. Identify overarching goals that span across segments and develop unified approaches to helping clients achieve them. Connect advisory services to these universal aspirations.]
5. COMPREHENSIVE OBJECTION HANDLING
[Provide 5 detailed points. Create a unified objection-handling strategy that addresses the most important concerns across all segments. For each objection, develop a universal counter-argument that works regardless of segment.]
6. CORE VALUE PROPOSITION
[Provide 5 detailed points. Develop a single, powerful value proposition that aligns with the core values of all segments. Focus on the universal benefits that resonate across all audience groups.]
7. UNIFIED DECISION-MAKING FRAMEWORK
[Provide 5 detailed points. Create a universal framework for understanding and influencing the decision-making process across all segments. Identify common stages, stakeholders, and considerations that apply broadly.]
8. UNIVERSAL METRICS AND KPIs
[Provide 5 detailed points. Identify key performance indicators and metrics that matter across all segments. Develop a unified measurement framework that demonstrates the value of advisory services regardless of client segment.]
9. INTEGRATED COMMUNICATION STRATEGY
[Provide 5 detailed points. Develop one comprehensive communication approach that works across all segments. Focus on channels, messaging formats, and cadence that effectively reach and engage all audience groups.]
10. UNIFIED CONTENT FRAMEWORK
[Provide 5 detailed points. Create a content strategy that addresses universal needs while accommodating segment variations. Identify themes, formats, and distribution approaches that work across all segments with minor adaptations.]
11. VERSATILE LEAD MAGNETS
[Provide 5 detailed points. Develop lead magnet concepts that appeal to all segments, with slight modifications if needed. Focus on resources that address universal pain points while being adaptable to different contexts.]

## Segment Research:
${segmentData}

Important notes:
- Consider the services the client wants to avail (mentioned above). Always contextualize and inspire your responses from them (if applicable).
- Create a compelling title that CLEARLY NAMES the specific industry segments covered in the playbook (e.g., real estate development, property management, brokerage, STR management, etc.)
- Each point must be a SINGLE paragraph (not multiple short paragraphs)
- Focus on creating ONE unified playbook, not a collection of segment-specific approaches
- Identify common patterns and themes across ALL segments and build a comprehensive strategy around them
- Where segments differ significantly, develop adaptable approaches that work with minor modifications
- Extract SPECIFIC details from the research - do not generalize or water down
- Use EXACT terminology, examples, metrics, and concerns found in the research
- For any point where the research provides detailed context (e.g., "Why it's a fear" or "Industry Insights"), include these specific details rather than summarizing
- Maintain the depth and specificity of the original research in your playbook points
- If the research uses specific numbers or percentages, include these exact figures
- Include actual scenarios, consequences, and benefits mentioned in the research
- When describing how advisory and accounting services help, use the exact solutions mentioned in the research
- If the research includes specific industry challenges or trends, incorporate these directly
- Make each point highly detailed (4-6 sentences minimum) using content directly from the research
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
        console.log(`Trying model: ${model} for playbook generation`);
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
    
    return NextResponse.json({ 
      result: responseData.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error generating playbook:', error);
    return NextResponse.json({ error: 'Failed to generate playbook' }, { status: 500 });
  }
}