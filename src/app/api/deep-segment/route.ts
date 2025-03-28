
import { NextResponse } from 'next/server';

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

## Response Format (for each segment)

# DEEP SEGMENT RESEARCH: *segment name*

## FEARS

1.  [Fear 1 title] - What keeps your ideal customer up at night regarding their business?
    [A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format and content (explanation, advisory services) with 1- What are the worst-case scenarios they imagine could happen to their company?
3. same format and content (explanation, advisory services) with 1- How do they perceive potential threats to their job security or business stability?
4. same format and content (explanation, advisory services) with 1- What industry changes or market trends do they fear the most?
5. same format and content (explanation, advisory services) with 1- How do they feel about the possibility of making a wrong decision in their role?

## PAINS

1.  [Pain 1 title] - What are the biggest daily frustrations your ideal customer experiences in their role?
    [A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]
2. same format and content (explanation, advisory services) with 1- What tasks or processes do they find most time-consuming or inefficient?
3. same format and content (explanation, advisory services) with 1- How do they describe their main challenges when talking to peers or colleagues?
4. same format and content (explanation, advisory services) with 1- What negative experiences have they had with similar products or services in the past?
5. same format and content (explanation, advisory services) with 1- How do their current problems affect their ability to achieve their business goals?

## OBJECTIONS

1.  [Objection 1 title] - What are the primary reasons your ideal customer might be skeptical about your product or service?
    [A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss and counter by providing benefits of high-ticket advisory services, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format and content (explanation, advisory services) with 1-How do they evaluate the risks versus the benefits of adopting a new solution?
3. same format and content (explanation, advisory services) with 1-  What previous experiences with other providers might make them wary of trying your solution?
4. same format and content (explanation, advisory services) with 1- What financial or budgetary concerns do they have regarding your offering?
5. same format and content (explanation, advisory services) with 1- How do they perceive the difficulty of integrating your product or service into their existing workflows?

## GOALS

1.  [Goal 1 title] - What are the top three goals your ideal customer aims to achieve in the next year?
    [A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services help attain the goal, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format and content (explanation, advisory services) with 1- How do they measure success in their role or business?
3. same format and content (explanation, advisory services) with 1- What long-term visions or ambitions do they have for their company?
4. same format and content (explanation, advisory services) with 1- What are the immediate milestones they are working towards?
5. same format and content (explanation, advisory services) with 1- How do they prioritize their goals in the context of their daily responsibilities?

## VALUES

1.  [Value 1 title] - What ethical considerations are most important to your ideal customer when choosing a provider?
    [A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services align with this value, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format and content (explanation, advisory services) with 1- How do they define quality and value in a product or service?
3. same format and content (explanation, advisory services) with 1- What company culture aspects do they value in their own organization?
4. same format and content (explanation, advisory services) with 1- How do they prefer to build relationships with vendors and partners?
5. same format and content (explanation, advisory services) with 1- What do they value most in their business relationships (e.g., transparency, reliability, innovation)?

## DECISION-MAKING PROCESSES

1.  [Decision-Making Process 1 title] - What steps do they typically follow when evaluating a new product or service?
    [A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services fit into this process, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format and content (explanation, advisory services) with 1- Who else is involved in the decision-making process within their company?
3. same format and content (explanation, advisory services) with 1- What criteria are most important to them when selecting a solution?
4. same format and content (explanation, advisory services) with 1- How do they gather and assess information before making a decision?
5. same format and content (explanation, advisory services) with 1- What external resources (reviews, testimonials, case studies) do they rely on during the decision-making process?

## INFLUENCES

1.  [Influence 1 title] - Who are the thought leaders or industry experts your ideal customer trusts the most?
    [A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services can leverage this influence, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format and content (explanation, advisory services) with 1- What publications, blogs, or websites do they frequently read for industry news and insights?
3. same format and content (explanation, advisory services) with 1- How do they engage with their professional network to seek advice or recommendations?
4. same format and content (explanation, advisory services) with 1- What role do customer reviews and testimonials play in their purchasing decisions?
5. same format with 1- How do industry events, conferences, and webinars influence their perceptions and decisions?

## COMMUNICATION PREFERENCES

1.  [Communication Preference 1 title] - What communication channels do they use most frequently (email, social media, phone, etc.)?
    [A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services can adapt to this preference, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format and content (explanation, advisory services) with 1- How do they prefer to receive information about new products or services?
3. same format and content (explanation, advisory services) with 1- What type of content (articles, videos, infographics) do they find most engaging and useful?
4. same format and content (explanation, advisory services) with 1- How often do they like to be contacted by potential vendors?
5. same format and content (explanation, advisory services) with 1- What tone and style of communication do they respond to best (formal, casual, informative, etc.)?

---\n\n

[end of output format]

PLEASE, NO introductory texts, conversations, or conclusions. Just follow the format request above.

## Segment to Analyze:
${segment}`;
    
    console.log('OpenRouter API key exists:', !!process.env.OPENROUTER_API_KEY);
    

      const availableModels = [
        'google/gemini-2.0-flash-001',
        'qwen/qwq-32b',
        'deepseek/deepseek-r1-zero:free'
      ];
      
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
            continue; // Try next model
          }

          const responseData = await response.json();
          return responseData.choices[0].message.content;
        } catch (error) {
          console.error(`Error with model ${model} for segment:`, error);
          continue; // Try next model
        }
      }
    throw new Error('All models failed for segment');
    });

  // Wait for all segments to complete
  try {
    const results = await Promise.all(segmentPromises);
    
    // Combine all results with a separator
    const combinedResult = results.join('\n\n---\n\n');
    
    return NextResponse.json({ result: combinedResult });
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
  // Match any variation of segment headers
  // This will match: "SEGMENT", "## SEGMENT", "##SEGMENT", "---\nSEGMENT", etc.
  const segmentRegex = /(?:---\s*\n\s*)?(?:##\s*)?SEGMENT/gi;
  
  // Split the text
  const segments = text.split(segmentRegex);
  
  // Remove empty segments and normalize the segment headers
  const filteredSegments = segments
    .filter(segment => segment.trim() !== '')
    .map((segment) => `## SEGMENT${segment}`);

  return filteredSegments;
}