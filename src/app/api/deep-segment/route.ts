
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
  
    const prompt = `
 You are an empathetic B2B Researcher capable of deeply understanding and embodying the Ideal Customer Profile (ICP) for high-ticket advisory and consulting services.

## Your Task
Analyze the ICP provided below and generate a comprehensive market research profile FOR EACH SEGMENTS following the exact structure below. Use the information to identify the most relevant and impactful insights.
Provide exactly 5 items per category. There is a guide below to help you write each item.

## Response Format (for each segment)

# DEEP SEGMENT RESEARCH: *segment name*

## FEARS

1.  [Fear 1 title]
    [A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format with 1
3. same format with 1
4. same format with 1
5. same format with 1

## PAINS

1.  [Pain 1 title]
    [A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]
2. same format with 1
3. same format with 1
4. same format with 1
5. same format with 1

## OBJECTIONS

1.  [Objection 1 title]
    [A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss and counter by providing benefits of high-ticket advisory services, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format with 1
3. same format with 1
4. same format with 1
5. same format with 1

## GOALS

1.  [Goal 1 title]
    [A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services help attain the goal, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format with 1
3. same format with 1
4. same format with 1
5. same format with 1

## VALUES

1.  [Value 1 title]
    [A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services align with this value, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format with 1
3. same format with 1
4. same format with 1
5. same format with 1

## DECISION-MAKING PROCESSES

1.  [Decision-Making Process 1 title]
    [A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services fit into this process, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format with 1
3. same format with 1
4. same format with 1
5. same format with 1

## INFLUENCES

1.  [Influence 1 title]
    [A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services can leverage this influence, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format with 1
3. same format with 1
4. same format with 1
5. same format with 1

## COMMUNICATION PREFERENCES

1.  [Communication Preference 1 title]
    [A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

    **How Advisory Services Can Help**
    [Comprehensively discuss how high-ticket advisory services can adapt to this preference, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]
2. same format with 1
3. same format with 1
4. same format with 1
5. same format with 1

---\n\n

[end of output format. repeat for each segment]

## Segments to Analyze:
${content}`;
    
    console.log('OpenRouter API key exists:', !!process.env.OPENROUTER_API_KEY);
    
    try {
      // Use non-streaming approach for this first prompt
      console.log('Sending request to OpenRouter API...');
      
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
              messages: [{ role: 'user', content: prompt }],
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
      
      if (!responseData) {
        throw new Error(lastError || 'All models failed');
      }
      
      if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
        console.error('Invalid response structure from OpenRouter:', JSON.stringify(responseData));
        return NextResponse.json({ 
          error: 'Invalid response structure from OpenRouter',
          details: JSON.stringify(responseData) 
        }, { status: 500 });
      }
      console.log('result: ', responseData);
      return NextResponse.json({ 
        result: responseData.choices[0].message.content 
      });
    } catch (apiError) {
      console.error('Error calling OpenRouter API:', apiError);
      return NextResponse.json({ 
        error: 'Error calling OpenRouter API', 
        details: apiError instanceof Error ? apiError.message : String(apiError) 
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