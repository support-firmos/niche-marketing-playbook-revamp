// src/app/api/industry-advisory/route.ts
import { NextResponse } from 'next/server';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Edge runtime for better performance with long-running requests
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    console.log('Calling industry-advisory LLM call');
    
    const requestData = await request.json();
    const { generatedPlaybook} = requestData;
    
    if (!generatedPlaybook) {
      console.error('No playbook is provided in request');
      return NextResponse.json({ error: 'Playbook is required' }, { status: 400 });
    }
    
    const prompt = `
      You are skilled in analyzing Customer Marketing Playbooks, and based on that playbook, you recommend advisories as service for accounting firms.
      I have here 4 default advisories: Review of Financials, Goal & KPI setting, Cash Flow Forecasting, and Budgets & Projections.
      These are all advisory services available for subscription to the accounting firm clients.

      Your task is to read and analyze the marketing playbook attached below.
      And based on that playbook, generate a total of 2 industry-specific advisories.
      Your output is to be included among the 4 default advisories stated above. The only difference is that the 2 advisories you generated is
      much more tailored to the playbook and more industry-specific. Note that it must be an advisory.

      This is the marketing playbook: 
      ${generatedPlaybook}

      Please format your final response containing only two texts that are separated by a comma: advisory1, advisory2
      No introductions, conclusions, or any text in your final response. 
      Your final and only response must only constitute the two words separated with a comma.
    `;
    
    try {
      console.log('Sending request to OpenRouter API...');
      
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
              max_tokens: 20000,
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
      
      if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
        console.error('Invalid response structure from OpenRouter:', JSON.stringify(responseData));
        return NextResponse.json({ 
          error: 'Invalid response structure from OpenRouter',
          details: JSON.stringify(responseData) 
        }, { status: 500 });
      }
      
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
    console.error('Error in API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}