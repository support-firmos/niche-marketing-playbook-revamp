// src/app/api/deep-segment/route.ts
import { NextResponse } from 'next/server';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Node.js runtime to support longer execution times
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    console.log('Request data:', JSON.stringify(requestData));
    
    // Handle both segments array or a single string input
    let segments;
    if (requestData.segments && Array.isArray(requestData.segments)) {
      segments = requestData.segments;
    } else if (requestData.segmentInfo) {
      console.log('Single segment info detected, converting to array');
      segments = [requestData.segmentInfo];
    } else {
      console.log('Invalid segments data:', requestData);
      return NextResponse.json({ error: 'Invalid segments information' }, { status: 400 });
    }
    
    console.log(`Processing ${segments.length} segments`);
    
    // Process all segments
    const results = await Promise.all(segments.map(async (segment: any) => {
      // Handle segment info as either string or object
      let segmentInfo;
      let segmentName = "";
      
      if (typeof segment === 'string') {
        segmentInfo = segment;
      } else if (typeof segment === 'object') {
        if (segment.content) {
          segmentInfo = segment.content;
        } else {
          segmentInfo = JSON.stringify(segment);
        }
        
        if (segment.name) {
          segmentName = segment.name;
          // Remove emoji numbers if present in the segment name
          segmentName = segmentName.replace(/^\d️⃣\s*/, '');
          segmentName = segmentName.replace(/^\d️⃣\s*/, '');
        }
      }
      
      // Generate deep segment research for this segment
      const result = await generateDeepSegmentResearch(segmentInfo, segmentName);
      return {
        name: segmentName,
        deepResearch: result
      };
    }));
    
    // Combine all results
    const combinedResults = {
      allSegments: results,
      // Join all deep research content for using in the playbook
      combinedResearch: results.map(r => r.deepResearch).join('\n\n====================\n\n')
    };
    
    return NextResponse.json({ result: combinedResults });
    
  } catch (error) {
    console.error('Error in deep segment research:', error);
    return NextResponse.json({ error: 'Failed to generate deep segment research' }, { status: 500 });
  }
}

// Helper function to generate deep segment research for a single segment
async function generateDeepSegmentResearch(segmentInfo: string, segmentName: string) {
  const prompt = `You are an empathetic B2B Researcher capable of deeply understanding and embodying the Ideal Customer Profile (ICP) for high-ticket advisory and consulting services.

## Your Task
Analyze the ICP below provided below and generate a comprehensive market research profile following the exact structure below. Use the information to identify the most relevant and impactful insights.

## Analysis Requirements
Provide exactly 5 items per category. There is a guide below to help you write each item.

### FEARS (the deep-seated fears that drive the decision-making process of the target audience)
  Fear 1 - What keeps your ideal customer up at night regarding their business?
  Fear 2 - What are the worst-case scenarios they imagine could happen to their company?
  Fear 3 - How do they perceive potential threats to their job security or business stability?
  Fear 4 - What industry changes or market trends do they fear the most?
  Fear 5 - How do they feel about the possibility of making a wrong decision in their role?

### PAINS (Identify the specific problems and challenges the target audience faces regularly)
  Pain 1 - What are the biggest daily frustrations your ideal customer experiences in their role?
  Pain 2 - What tasks or processes do they find most time-consuming or inefficient?
  Pain 3 - How do they describe their main challenges when talking to peers or colleagues?
  Pain 4 - What negative experiences have they had with similar products or services in the past?
  Pain 5 - How do their current problems affect their ability to achieve their business goals?

### OBJECTIONS (Recognize the reasons why the target audience might hesitate to buy or engage with your product or service)
  Objection 1 - What are the primary reasons your ideal customer might be skeptical about your product or service?
  Objection 2 - How do they evaluate the risks versus the benefits of adopting a new solution?
  Objection 3 - What previous experiences with other providers might make them wary of trying your solution?
  Objection 4 - What financial or budgetary concerns do they have regarding your offering?
  Objection 5 - How do they perceive the difficulty of integrating your product or service into their existing workflows?

### GOALS (Determine the primary objectives and aspirations that drive the target audience's actions)
  Goal 1 - What are the top three goals your ideal customer aims to achieve in the next year?
  Goal 2 - How do they measure success in their role or business?
  Goal 3 - What long-term visions or ambitions do they have for their company?
  Goal 4 - What are the immediate milestones they are working towards?
  Goal 5 - How do they prioritize their goals in the context of their daily responsibilities?

### VALUES (Understand the core values that influence the target audience's decision-making process)
  Value 1 - What ethical considerations are most important to your ideal customer when choosing a provider?
  Value 2 - How do they define quality and value in a product or service?
  Value 3 - What company culture aspects do they value in their own organization?
  Value 4 - How do they prefer to build relationships with vendors and partners?
  Value 5 - What do they value most in their business relationships (e.g., transparency, reliability, innovation)?

### DECISION-MAKING PROCESSES (Gain insight into how the target audience makes purchasing decisions)
  Decision-Making Process 1 - What steps do they typically follow when evaluating a new product or service?
  Decision-Making Process 2 - Who else is involved in the decision-making process within their company?
  Decision-Making Process 3 - What criteria are most important to them when selecting a solution?
  Decision-Making Process 4 - How do they gather and assess information before making a decision?
  Decision-Making Process 5 - What external resources (reviews, testimonials, case studies) do they rely on during the decision-making process?

### INFLUENCES (Identify the key factors and individuals that influence the target audience's choices)
  Influence 1 - Who are the thought leaders or industry experts your ideal customer trusts the most?
  Influence 2 - What publications, blogs, or websites do they frequently read for industry news and insights?
  Influence 3 - How do they engage with their professional network to seek advice or recommendations?
  Influence 4 - What role do customer reviews and testimonials play in their purchasing decisions?
  Influence 5 - How do industry events, conferences, and webinars influence their perceptions and decisions?

### COMMUNICATION PREFERENCES (Understand how the target audience prefers to receive and interact with marketing messages)
  Communication Preference 1 - What communication channels do they use most frequently (email, social media, phone, etc.)?
  Communication Preference 2 - How do they prefer to receive information about new products or services?
  Communication Preference 3 - What type of content (articles, videos, infographics) do they find most engaging and useful?
  Communication Preference 4 - How often do they like to be contacted by potential vendors?
  Communication Preference 5 - What tone and style of communication do they respond to best (formal, casual, informative, etc.)?

## Response Format

🔎🔎🔎 MARKET RESEARCH - \${segmentName} 🔎🔎🔎

---------------------------------------------------------------------------------

⚠️ FEARS ⚠️

1️⃣ [Fear 1 title]
[A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services address it. Use paragraph and/or bullet points.]


2️⃣ [Fear 2 title]
[A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services address it. Use paragraph and/or bullet points.]


3️⃣ [Fear 3 title]
[A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services address it. Use paragraph and/or bullet points.]


4️⃣ [Fear 4 title]
[A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services address it. Use paragraph and/or bullet points.]


5️⃣ [Fear 5 title]
[A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services address it. Use paragraph and/or bullet points.]

---------------------------------------------------------------------------------

⚙️ PAINS ⚙️

1️⃣ [Pain 1 title]
[A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services address it. Use paragraph and/or bullet points.]


2️⃣ [Pain 2 title]
[A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services address it. Use paragraph and/or bullet points.]


3️⃣ [Pain 3 title]
[A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services address it. Use paragraph and/or bullet points.]


4️⃣ [Pain 4 title]
[A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services address it. Use paragraph and/or bullet points.]


5️⃣ [Pain 5 title]
[A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services address it. Use paragraph and/or bullet points.]

---------------------------------------------------------------------------------

⛔ OBJECTIONS ⛔

1️⃣ [Objection 1 title]
[A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss and counter by providing benefits of high-ticket advisory services. Use paragraph and/or bullet points.]


2️⃣ [Objection 2 title]
[A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss and counter by providing benefits of high-ticket advisory services. Use paragraph and/or bullet points.]


3️⃣ [Objection 3 title]
[A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss and counter by providing benefits of high-ticket advisory services. Use paragraph and/or bullet points.]


4️⃣ [Objection 4 title]
[A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss and counter by providing benefits of high-ticket advisory services. Use paragraph and/or bullet points.]


5️⃣ [Objection 5 title]
[A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss and counter by providing benefits of high-ticket advisory services. Use paragraph and/or bullet points.]

---------------------------------------------------------------------------------

🎯 GOALS 🎯

1️⃣ [Goal 1 title]
[A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services help attain the goal. Use paragraph and/or bullet points.]


2️⃣ [Goal 2 title]
[A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services help attain the goal. Use paragraph and/or bullet points.]


3️⃣ [Goal 3 title]
[A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services help attain the goal. Use paragraph and/or bullet points.]


4️⃣ [Goal 4 title]
[A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services help attain the goal. Use paragraph and/or bullet points.]


5️⃣ [Goal 5 title]
[A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services help attain the goal. Use paragraph and/or bullet points.]

---------------------------------------------------------------------------------

💎 VALUES 💎

1️⃣ [Value 1 title]
[A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services align with this value. Use paragraph and/or bullet points.]


2️⃣ [Value 2 title]
[A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services align with this value. Use paragraph and/or bullet points.]


3️⃣ [Value 3 title]
[A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services align with this value. Use paragraph and/or bullet points.]


4️⃣ [Value 4 title]
[A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services align with this value. Use paragraph and/or bullet points.]


5️⃣ [Value 5 title]
[A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services align with this value. Use paragraph and/or bullet points.]

---------------------------------------------------------------------------------

🧠 DECISION-MAKING PROCESSES 🧠

1️⃣ [Decision-Making Process 1 title]
[A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services fit into this process. Use paragraph and/or bullet points.]


2️⃣ [Decision-Making Process 2 title]
[A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services fit into this process. Use paragraph and/or bullet points.]


3️⃣ [Decision-Making Process 3 title]
[A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services fit into this process. Use paragraph and/or bullet points.]


4️⃣ [Decision-Making Process 4 title]
[A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services fit into this process. Use paragraph and/or bullet points.]


5️⃣ [Decision-Making Process 5 title]
[A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services fit into this process. Use paragraph and/or bullet points.]

---------------------------------------------------------------------------------

🎬 INFLUENCES 🎬

1️⃣ [Influence 1 title]
[A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services can leverage this influence. Use paragraph and/or bullet points.]


2️⃣ [Influence 2 title]
[A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services can leverage this influence. Use paragraph and/or bullet points.]


3️⃣ [Influence 3 title]
[A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services can leverage this influence. Use paragraph and/or bullet points.]


4️⃣ [Influence 4 title]
[A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services can leverage this influence. Use paragraph and/or bullet points.]


5️⃣ [Influence 5 title]
[A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services can leverage this influence. Use paragraph and/or bullet points.]

---------------------------------------------------------------------------------

📞 COMMUNICATION PREFERENCES 📞

1️⃣ [Communication Preference 1 title]
[A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services can adapt to this preference. Use paragraph and/or bullet points.]


2️⃣ [Communication Preference 2 title]
[A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services can adapt to this preference. Use paragraph and/or bullet points.]


3️⃣ [Communication Preference 3 title]
[A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services can adapt to this preference. Use paragraph and/or bullet points.]


4️⃣ [Communication Preference 4 title]
[A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services can adapt to this preference. Use paragraph and/or bullet points.]


5️⃣ [Communication Preference 5 title]
[A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

💡 How Advisory Services Can Help
[Comprehensively discuss how high-ticket advisory services can adapt to this preference. Use paragraph and/or bullet points.]

---------------------------------------------------------------------------------

## Segment Information to Analyze:
${segmentInfo}`;

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
      console.log(`Trying model: ${model} for deep segment research`);
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

  return responseData.choices[0].message.content;
}