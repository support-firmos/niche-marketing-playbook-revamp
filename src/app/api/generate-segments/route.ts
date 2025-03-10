// src/app/api/generate-segments/route.ts
import { NextResponse } from 'next/server';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Edge runtime for better performance with long-running requests
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    console.log('Generate-segments API called');
    
    const requestData = await request.json();
    const { industry } = requestData;
    
    if (!industry) {
      console.error('No industry provided in request');
      return NextResponse.json({ error: 'Industry is required' }, { status: 400 });
    }
    
    console.log('Industry from request:', industry);
    
    const prompt = `
    ## Accounting Advisory Services - Market Fit & Segment Research for ${industry}

    ### Introduction & Context

    Accountants often undervalue their services by treating them as mere "compliance" work (e.g., tax returns, basic bookkeeping). However, these same professionals can (and should) offer **high-ticket recurring services** such as advisory, consulting, or niche-specific guidance. This prompt helps identify the most profitable segments within the ${industry} industry where accounting professionals can provide high-value, consultative offerings that solve deeper client pain points and justify higher pricing.

    ---

    ### Task

    Determine 5-7 ${industry} industry segments that would be the best fit for high-ticket, recurring accounting advisory services. These must meet:

    1. **Financial Viability**: $5M–$150M annual revenue (can afford $15K–$30K/month retainers)
    2. **Recurring Need Justification**: Requires ongoing financial strategy, not one-time services
    3. **Accessibility**: Decision-makers reachable via LinkedIn/email/phone
    4. **Service Fit**: Needs budgeting, cash flow management, KPI tracking, or financial advisory

    ---

    ### Output Format

    Present 5-7 well-researched market segments (niches) within the ${industry} industry, ranked from highest to lowest potential profitability. Use the following visual format:

   
    ======================================
    SEGMENT 1: [SEGMENT NAME]
    ======================================

    - **Justification for Advisory Services**: [Specific need for recurring financial leadership]
    - **Estimated Market US Potential**: [X companies, $Y–$Z revenue range]
    - **Ease of Outreach**: [Low/Medium/High based on decision-maker visibility]
    - **Pain Points**: [Key financial challenges this segment faces]

    ======================================
    SEGMENT 2: [SEGMENT NAME]
    ======================================

    - **Justification for Advisory Services**: [Specific need for recurring financial leadership]
    - **Estimated Market US Potential**: [X companies, $Y–$Z revenue range]
    - **Ease of Outreach**: [Low/Medium/High based on decision-maker visibility]
    - **Pain Points**: [Key financial challenges this segment faces]
    

    *(continue same format for all 5-7 segments)*

    ---

    ### Key Targeting Criteria

    When identifying the best segments, prioritize:
    - Complex financial operations requiring ongoing expertise
    - Regulatory or compliance challenges specific to ${industry} subsectors
    - Growth-stage companies needing financial strategy but not ready for full-time financial leadership
    - Businesses with potential for value-based pricing of advisory services
    
    Important Notes:
    - DO NOT USE ANY CONVERSATIONAL WORDS OR LIKE INTROS, GIVE THE OUTPUT DIRECTLY.

    Arrange segments from Highest to Lowest Profiting Segments for Accounting Advisory Services with clear visual separation between each segment.
    `;
    
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
          
        } catch (modelError: any) {
          console.error(`Error with model ${model}:`, modelError);
          lastError = `Error with model ${model}: ${modelError.message}`;
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
    console.error('Error in generate-segments API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate segments',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}