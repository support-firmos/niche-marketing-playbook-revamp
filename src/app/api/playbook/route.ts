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

Note that you must first analyze this research to inspire and influence your output. Basically, your goal is to create an Inbound Marketing Blueprint out of that segment research.
Again, heavily influence your answers based on this research above! If able, mention some data/insights provided there.

FORMAT YOUR RESPONSE AS A JSON ARRAY OF OBJECTS, where each object represents 12 attributes. Follow this JSON format below:

[
{
"title": "compelling title here that references specific industry segments covered in the blueprint (e.g., 'Inbound Marketing Blueprint for Property Management, Development & Brokerage Services')",
"audience": 
"- [Audience 1 title (Across all segments provided, identify a specific group of people the marketing content is aimed at, helping to tailor the message to those who are most likely to benefit from the offer)]\\n[In 3 sentences, provide a comprehensive, industry-specific insights, specific, and data-driven explanation for this goal.]\\n With the same format, put more 4 target audiences",
"pain": 
"- [Paint Point 1 title (Across all segments provided, identify a common challenge and frustration the target audience faces, directly addressing their issues and making the content more relevant and compelling.)]\\n[In 3 sentences, provide a comprehensive, industry-specific insights, specific, and data-driven explanation for this pain point]\\n With the same format, put more 4 pain points",
"fear": 
"- [Fear 1 title (Across all segments provided, identify a universal deep-seated fear and worst-case scenario that influence the decision-making process, acknowledging and mitigating these concerns.)]\\n[In 3 sentences, provide a comprehensive, industry-specific insights, specific, and data-driven explanation for this fear]\\n With the same format, put more 4 fears",
"goals": 
"- [Goal 1 title (Across all segments provided, write a common primary objective and long-term ambition of the target audience, ensuring the content aligns with their desired outcomes and resonates with their objectives.)]\\n[In 3 sentences, provide a comprehensive, industry-specific insights, specific, and data-driven explanation for this goal]\\n With the same format, put more 4 goals",
"objection": 
"- [Objection 1 title (Across all segments provided, recognize a shared potential reason for hesitation or skepticism about the offer, preemptively countering these concerns to make the offer more attractive and reduce resistance.)]\\n[In 3 sentences, provide a comprehensive, industry-specific insights, specific, and data-driven explanation for this objection]\\n With the same format, put more 4 objections",
"value": 
"- [Core Value 1 title (Across all segments provided, write an ethical consideration that influences the target audience's decision-making process, ensuring the content aligns with their values.)]\\n[In 3 sentences, provide a comprehensive, industry-specific insights, specific, and data-driven explanation for this core value]\\n With the same format, put more 4 core values",
"decision": 
"- [Decision-making Process 1 title (Across all segments provided, write the step and the stakeholders involved in evaluating and purchasing a new product or service, providing insight into the evaluation process)]\\n[In 3 sentences, provide a comprehensive, industry-specific insights, specific, and data-driven explanation for this decision-making process]\\n With the same format, put more 4 decision-making processes",
"metrics": 
"- [Key Metric 1 title (Across all segments provided, identify a performance indicator that the target audience uses to measure success, demonstrating ROI and effectiveness by focusing on these key metrics.)]\\n[provide a comprehensive, industry-specific insights, specific, and data-driven explanation for this key metric]\\n With the same format, put more 4 key metrics",
"communication": 
"- [Communication Preference 1 title (Across all segments provided, write a preferred communication channel and content type of the target audience, ensuring the content is delivered through the most effective channels.)]\\n[Provide a comprehensive, industry-specific insights, specific, and data-driven explanation for this communication preference]\\n With the same format, put more 4 communication preferences",
"content":
"- [Content Tone and Style 1 title (Across all segments provided, identify an appropriate tone and style for the content, ensuring it resonates with the target audience.)]\\n[provide a comprehensive, industry-specific insights, specific, and data-driven explanation for this content tone/style]\\n With the same format, put more 4 content tones/styles",
"lead": 
"- [Lead Magnets Titles 1 title (Across all segments provided, identify a free resource or incentive offered to attract and engage potential clients, such as audits, consultations, or guides. In the form of an engaging and hooking title)]\\n With the same format, put more 4 lead magnet titles"
}
]

Format Requirements (PLEASE FOLLOW THIS STRICTLY)
- Format your ENTIRE response as a valid JSON array THAT CAN BE PARSED USING JSON.parse()
- Avoid using characters that can make JSON.parse() unsuccessful
- Do NOT include any text before or after the JSON
- Please provide a valid JSON response without markdown formatting or additional text.
- Maintain the exact structure shown above
- Do NOT include any introductory text, disclaimers, or conclusions

Important notes on content:
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
- Don't put out vague, generic and general insights. Always be specific and detailed as much as possible.
- If the research includes specific industry challenges or trends, incorporate these directly
- Make each point highly detailed (5-7 sentences minimum) using content directly from the research
`;
    
    const availableModels = [
      'google/gemini-2.0-flash-001',
      'qwen/qwq-32b',
      'deepseek/deepseek-r1-zero:free'
    ];
    
    let lastError = null;
    let responseData = null;
    
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
          continue;
        }
        
        responseData = await response.json();
        console.log(`Success with model: ${model}`);
        break;
        
      } catch (modelError: Error | unknown) {
        console.error(`Error with model ${model}:`, modelError);
        lastError = `Error with model ${model}: ${modelError instanceof Error ? modelError.message : String(modelError)}`;
        continue; // Try the next model
      }
    }
    
    if (!responseData) {
      throw new Error(lastError || 'All models failed');
    }
    
    const result = responseData.choices[0].message.content;
    let parsedPlaybook = [];

    try {
      let cleanedResult = result
        .replace(/```json|```/g, '') 
        .trim();
        
      const startIndex = cleanedResult.indexOf('[');
      const endIndex = cleanedResult.lastIndexOf(']') + 1;
      
      if (startIndex >= 0 && endIndex > startIndex) {
        cleanedResult = cleanedResult.substring(startIndex, endIndex);
      }
  
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