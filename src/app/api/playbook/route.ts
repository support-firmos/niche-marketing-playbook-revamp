// src/app/api/playbook/route.ts
import { formatPlaybookForDisplay } from '@/app/utilities/formatPlaybook';
import { NextResponse } from 'next/server';

export const maxDuration = 300;
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
    
    const prompt = `Create a comprehensive, integrated marketing playbook that synthesizes insights from all segment research (attached below) into a unified strategy. Find the common themes, patterns, and synergies to develop an overarching approach that works across all segments while acknowledging important variations.

Here is the segment research:
${content}

Note that you must first heavily analyze this research to inspire and influence your output. Basically, your goal is to create a marketing playbook/Inbound Marketing Blueprint out of that segment research.

FORMAT YOUR RESPONSE AS A JSON ARRAY OF OBJECTS, where each object represents 12 attributes. Follow this JSON format below:

[
{
"title": "compelling title here that references specific industry segments covered in your playbook (e.g., 'Inbound Marketing Blueprint for Property Management, Development & Brokerage Services')",
"audience": 
"- [Audience Approach 1 title] — [unified approach to targeting all audience segments. Identify common characteristics, overlapping needs, and shared decision patterns. Focus on creating a single messaging framework that resonates across all identified segments. Must be 4-6 sentences.]\\n- [Audience Approach 2 title] — [unified approach to targeting all audience segments. Identify common characteristics, overlapping needs, and shared decision patterns. Focus on creating a single messaging framework that resonates across all identified segments. Must be 4-6 sentences.]\\n- [Audience Approach 3 title] — [unified approach to targeting all audience segments. Identify common characteristics, overlapping needs, and shared decision patterns. Focus on creating a single messaging framework that resonates across all identified segments. Must be 4-6 sentences.]\\n- [Audience Approach 4 title] — [unified approach to targeting all audience segments. Identify common characteristics, overlapping needs, and shared decision patterns. Focus on creating a single messaging framework that resonates across all identified segments. Must be 4-6 sentences.]\\n- [Audience Approach 5 title] — [unified approach to targeting all audience segments. Identify common characteristics, overlapping needs, and shared decision patterns. Focus on creating a single messaging framework that resonates across all identified segments. Must be 4-6 sentences.]",
"pain": 
"- [Paint Point 1 title] — [significant pain point that appears across multiple segments. Focus on those that represent common ground and create a unified approach to addressing them through advisory and accounting services. Must be 4-6 sentences.]\\n- [Paint Point 2 title] — [significant pain point that appears across multiple segments. Focus on those that represent common ground and create a unified approach to addressing them through advisory and accounting services. Must be 4-6 sentences.]\\n- [Paint Point 3 title] — [significant pain point that appears across multiple segments. Focus on those that represent common ground and create a unified approach to addressing them through advisory and accounting services. Must be 4-6 sentences.]\\n- [Paint Point 4 title] — [significant pain point that appears across multiple segments. Focus on those that represent common ground and create a unified approach to addressing them through advisory and accounting services. Must be 4-6 sentences.]\\n- [Paint Point 5 title] — [significant pain point that appears across multiple segments. Focus on those that represent common ground and create a unified approach to addressing them through advisory and accounting services. Must be 4-6 sentences.]",
"fear": 
"- [Fear Mitigation 1 title] — [comprehensive approach to addressing fears and concerns across all segments. Create unified messaging that addresses these fears, acknowledging variations while focusing on common solutions. Must be 4-6 sentences.]\\n- [Fear Mitigation 2 title] — [comprehensive approach to addressing fears and concerns across all segments. Create unified messaging that addresses these fears, acknowledging variations while focusing on common solutions. Must be 4-6 sentences.]\\n- [Fear Mitigation 3 title] — [comprehensive approach to addressing fears and concerns across all segments. Create unified messaging that addresses these fears, acknowledging variations while focusing on common solutions. Must be 4-6 sentences.]\\n- [Fear Mitigation 4 title] — [comprehensive approach to addressing fears and concerns across all segments. Create unified messaging that addresses these fears, acknowledging variations while focusing on common solutions. Must be 4-6 sentences.]\\n- [Fear Mitigation 5 title] — [comprehensive approach to addressing fears and concerns across all segments. Create unified messaging that addresses these fears, acknowledging variations while focusing on common solutions. Must be 4-6 sentences.]",
"goals": 
"- [Goals 1 title] — [overarching goal that span across segments and develop unified approaches to helping clients achieve them. Connect advisory services to these universal aspirations. Must be 4-6 sentences.]\\n- [Goals 2 title] — [overarching goal that span across segments and develop unified approaches to helping clients achieve them. Connect advisory services to these universal aspirations. Must be 4-6 sentences.]\\n- [Goals 3 title] — [overarching goal that span across segments and develop unified approaches to helping clients achieve them. Connect advisory services to these universal aspirations. Must be 4-6 sentences.]\\n- [Goals 4 title] — [overarching goal that span across segments and develop unified approaches to helping clients achieve them. Connect advisory services to these universal aspirations. Must be 4-6 sentences.]\\n- [Goals 5 title] — [overarching goal that span across segments and develop unified approaches to helping clients achieve them. Connect advisory services to these universal aspirations. Must be 4-6 sentences.]",
"objection": 
"- [Objection Handling 1 title] — [unified objection-handling strategy that addresses the most important concerns across all segments. For each objection, develop a universal counter-argument that works regardless of segment. Must be 4-6 sentences.]\\n- [Objection Handling 2 title] — [unified objection-handling strategy that addresses the most important concerns across all segments. For each objection, develop a universal counter-argument that works regardless of segment. Must be 4-6 sentences.]\\n- [Objection Handling 3 title] — [unified objection-handling strategy that addresses the most important concerns across all segments. For each objection, develop a universal counter-argument that works regardless of segment. Must be 4-6 sentences.]\\n- [Objection Handling 4 title] — [unified objection-handling strategy that addresses the most important concerns across all segments. For each objection, develop a universal counter-argument that works regardless of segment. Must be 4-6 sentences.]\\n- [Objection Handling 5 title] — [unified objection-handling strategy that addresses the most important concerns across all segments. For each objection, develop a universal counter-argument that works regardless of segment. Must be 4-6 sentences.]",
"value": 
"- [Core Value Proposition 1 title] — [single, powerful value proposition that aligns with the core values of all segments. Focus on the universal benefits that resonate across all audience groups. Must be 4-6 sentences.]\\n- [Core Value Proposition 2 title] — [single, powerful value proposition that aligns with the core values of all segments. Focus on the universal benefits that resonate across all audience groups. Must be 4-6 sentences.]\\n- [Core Value Proposition 3 title] — [single, powerful value proposition that aligns with the core values of all segments. Focus on the universal benefits that resonate across all audience groups. Must be 4-6 sentences.]\\n- [Core Value Proposition 4 title] — [single, powerful value proposition that aligns with the core values of all segments. Focus on the universal benefits that resonate across all audience groups. Must be 4-6 sentences.]\\n- [Core Value Proposition 5 title] — [single, powerful value proposition that aligns with the core values of all segments. Focus on the universal benefits that resonate across all audience groups. Must be 4-6 sentences.]",
"decision": 
"- [Decision-making Framework 1 title] — [universal framework for understanding and influencing the decision-making process across all segments. Identify common stages, stakeholders, and considerations that apply broadly. Must be 4-6 sentences.]\\n- [Decision-making Framework 2 title] — [universal framework for understanding and influencing the decision-making process across all segments. Identify common stages, stakeholders, and considerations that apply broadly. Must be 4-6 sentences.]\\n- [Decision-making Framework 3 title] — [universal framework for understanding and influencing the decision-making process across all segments. Identify common stages, stakeholders, and considerations that apply broadly. Must be 4-6 sentences.]\\n- [Decision-making Framework 4 title] — [universal framework for understanding and influencing the decision-making process across all segments. Identify common stages, stakeholders, and considerations that apply broadly. Must be 4-6 sentences.]\\n- [Decision-making Framework 5 title] — [universal framework for understanding and influencing the decision-making process across all segments. Identify common stages, stakeholders, and considerations that apply broadly. Must be 4-6 sentences.]",
"metrics": 
"- [Metric and KPIs 1 title] — [key performance indicator and metric that matter across all segments. Develop a unified measurement framework that demonstrates the value of advisory services regardless of client segment. Must be 4-6 sentences.]\\n- [Metric and KPIs 2 title] — [key performance indicator and metric that matter across all segments. Develop a unified measurement framework that demonstrates the value of advisory services regardless of client segment. Must be 4-6 sentences.]\\n- [Metric and KPIs 3 title] — [key performance indicator and metric that matter across all segments. Develop a unified measurement framework that demonstrates the value of advisory services regardless of client segment. Must be 4-6 sentences.]\\n- [Metric and KPIs 4 title] — [key performance indicator and metric that matter across all segments. Develop a unified measurement framework that demonstrates the value of advisory services regardless of client segment. Must be 4-6 sentences.]\\n- [Metric and KPIs 5 title] — [key performance indicator and metric that matter across all segments. Develop a unified measurement framework that demonstrates the value of advisory services regardless of client segment. Must be 4-6 sentences.]",
"communication": 
"- [Communication Strategy 1 title] — [comprehensive communication approach that works across all segments. Focus on channels, messaging formats, and cadence that effectively reach and engage all audience groups. Must be 4-6 sentences.]\\n- [Communication Strategy 2 title] — [comprehensive communication approach that works across all segments. Focus on channels, messaging formats, and cadence that effectively reach and engage all audience groups. Must be 4-6 sentences.]\\n- [Communication Strategy 3 title] — [comprehensive communication approach that works across all segments. Focus on channels, messaging formats, and cadence that effectively reach and engage all audience groups. Must be 4-6 sentences.]\\n- [Communication Strategy 4 title] — [comprehensive communication approach that works across all segments. Focus on channels, messaging formats, and cadence that effectively reach and engage all audience groups. Must be 4-6 sentences.]\\n- [Communication Strategy 5 title] — [comprehensive communication approach that works across all segments. Focus on channels, messaging formats, and cadence that effectively reach and engage all audience groups. Must be 4-6 sentences.]",
"content":
"- [Content Framework 1 title] — [content strategy that addresses universal needs while accommodating segment variations. Identify themes, formats, and distribution approaches that work across all segments with minor adaptations. Must be 4-6 sentences.]\\n- [Content Framework 2 title] — [content strategy that addresses universal needs while accommodating segment variations. Identify themes, formats, and distribution approaches that work across all segments with minor adaptations. Must be 4-6 sentences.]\\n- [Content Framework 3 title] — [content strategy that addresses universal needs while accommodating segment variations. Identify themes, formats, and distribution approaches that work across all segments with minor adaptations. Must be 4-6 sentences.]\\n- [Content Framework 4 title] — [content strategy that addresses universal needs while accommodating segment variations. Identify themes, formats, and distribution approaches that work across all segments with minor adaptations. Must be 4-6 sentences.]\\n- [Content Framework 5 title] — [content strategy that addresses universal needs while accommodating segment variations. Identify themes, formats, and distribution approaches that work across all segments with minor adaptations. Must be 4-6 sentences.]",
"lead": 
"- [Lead Magnets 1 title] — [lead magnet concept that appeal to all segments, with slight modifications if needed. Focus on resources that address universal pain points while being adaptable to different contexts. Must be 4-6 sentences.]\\n- [Lead Magnets 2 title] — [lead magnet concept that appeal to all segments, with slight modifications if needed. Focus on resources that address universal pain points while being adaptable to different contexts. Must be 4-6 sentences.]\\n- [Lead Magnets 3 title] — [lead magnet concept that appeal to all segments, with slight modifications if needed. Focus on resources that address universal pain points while being adaptable to different contexts. Must be 4-6 sentences.]\\n- [Lead Magnets 4 title] — [lead magnet concept that appeal to all segments, with slight modifications if needed. Focus on resources that address universal pain points while being adaptable to different contexts. Must be 4-6 sentences.]\\n- [Lead Magnets 5 title] — [lead magnet concept that appeal to all segments, with slight modifications if needed. Focus on resources that address universal pain points while being adaptable to different contexts. Must be 4-6 sentences.]"
}
]

Format Requirements (PLEASE FOLLOW THIS STRICTLY)
- Format your ENTIRE response as a valid JSON array THAT CAN BE PARSED USING JSON.parse()
- Avoid using characters that can make JSON.parse() unsuccessful
- Do NOT include any text before or after the JSON
- Please provide a valid JSON response without markdown formatting or additional text.
- Maintain the exact structure shown above
- Do NOT include any introductory text, disclaimers, or conclusions

Important notes:
- Focus on creating a unified playbook, not a collection of segment-specific approaches
- Identify common patterns and themes across ALL segments in the research data given, and build a comprehensive strategy around them
- Extract SPECIFIC details from the research - do not generalize or water down
- Where segments differ significantly, develop adaptable approaches that work with minor modifications
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
            messages: [{
              role: 'user',
              content: `You are an expert AI copywriter tasked with creating a single, cohesive marketing playbook for high-ticket advisory and accounting services that incorporates insights from ALL market segments provided. Your goal is to create a unified playbook. Refer to the details below:\n\n${prompt}`
            }],
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
    
    const result = responseData.choices[0].message.content;
    let parsedPlaybook = [];

    try {
  // More robust JSON parsing approach
      let cleanedResult = result
        .replace(/```json|```/g, '')  // Remove code blocks
        .trim();
        
      const startIndex = cleanedResult.indexOf('[');
      const endIndex = cleanedResult.lastIndexOf(']') + 1;
      
      if (startIndex >= 0 && endIndex > startIndex) {
        cleanedResult = cleanedResult.substring(startIndex, endIndex);
      }
  
  // Try to parse the JSON
      parsedPlaybook = JSON.parse(cleanedResult);
      console.log(`Successfully parsed ${parsedPlaybook.length} from response`);
    } catch (error) {
      console.error('Error parsing playbook JSON:', error);
      console.log('Raw content:', result.substring(0, 500) + '...');
    }

    const formattedContent = formatPlaybookForDisplay(parsedPlaybook);

    return NextResponse.json({ 
      result: {
        result,
        formattedContent,
        playbook: parsedPlaybook
      }
    });
  } catch (error) {
    console.error('Error generating playbook:', error);
    return NextResponse.json({ error: 'Failed to generate playbook' }, { status: 500 });
  }
}