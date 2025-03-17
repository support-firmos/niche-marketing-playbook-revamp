// src/app/api/deep-segment/route.ts
import { NextResponse } from 'next/server';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Node.js runtime to support longer execution times
export const runtime = 'nodejs';

// Fix first occurrence of any type - define a proper interface
interface SegmentData {
  name?: string;
  content?: string;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    console.log('Request data:', JSON.stringify(requestData));
    
    // Handle both segments array or a single string input
    let segments;
    if (requestData.segments && Array.isArray(requestData.segments)) {
      // Make sure the segments have the expected structure
      segments = requestData.segments.map((segment: SegmentData, index: number) => {
        // Ensure each segment has name and content properties
        return {
          name: segment.name || `Segment ${index + 1}`,
          content: segment.content || JSON.stringify(segment)
        };
      });
      
      console.log(`Processed ${segments.length} segments with standard format`);
    } else if (requestData.segmentInfo) {
      console.log('Single segment info detected, converting to array');
      segments = [requestData.segmentInfo];
    } else {
      console.log('Invalid segments data:', requestData);
      return NextResponse.json({ error: 'Invalid segments information' }, { status: 400 });
    }
    
    console.log(`Processing ${segments.length} segments`);
    
    // Process all segments
    const results = await Promise.all(segments.map(async (segment: SegmentData, index: number) => {
      // Handle segment info as either string or object
      let segmentInfo;
      const segmentName = segment.name || `Segment ${index + 1}`;
      
      if (typeof segment === 'string') {
        segmentInfo = segment;
      } else if (typeof segment === 'object') {
        if (segment.content) {
          segmentInfo = segment.content;
        } else {
          segmentInfo = JSON.stringify(segment);
        }
      } else {
        segmentInfo = String(segment);
      }
      const services = requestData.services;
      // Generate deep segment research for this segment
      const result = await generateDeepSegmentResearch(segmentInfo, services);
      return {
        name: segmentName,
        deepResearch: result,
      };
    }));
    
    // Combine all results
    const combinedResearch = generateCombinedResearch(results);
    
    // Format the results for display in the frontend
    const formattedContent = formatSegmentsForDisplay(results);
    
    return NextResponse.json({
      result: {
        allSegments: results,
        combinedResearch,
        formattedContent // Add the formatted content for frontend display
      }
    });
    
  } catch (error) {
    console.error('Error in deep segment research:', error);
    return NextResponse.json({ error: 'Failed to generate deep segment research' }, { status: 500 });
  }
}

// Helper function to generate deep segment research for a single segment
async function generateDeepSegmentResearch(segmentInfo: string, services: string) {
  const prompt = `You are an empathetic B2B Researcher capable of deeply understanding and embodying the Ideal Customer Profile (ICP) for high-ticket advisory and consulting services.

## Your Task
Analyze the ICP below provided below and generate a comprehensive market research profile following the exact structure below. Use the information to identify the most relevant and impactful insights.


Here is a list of all the services the client wants to avail: ${services}

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

# DEEP INDUSTRY RESEARCH: [niche/industry name]

## *segment name* *segment number*
### FEARS

1. [Fear 1 title]
[A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


2. [Fear 2 title]
[A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]


3. [Fear 3 title]
[A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]


4. [Fear 4 title]
[A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]


5. [Fear 5 title]
[A comprehensive explanation of the fear. Must include real-world business impact. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]

### PAINS

1. [Pain 1 title]
[A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]


2. [Pain 2 title]
[A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]


3. [Pain 3 title]
[A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]


4. [Pain 4 title]
[A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]


5. [Pain 5 title]
[A comprehensive explanation of the pain. Must include real-world negative consequences or financial impact. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services address it, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above).  Use paragraph and/or bullet points.]

### OBJECTIONS

1. [Objection 1 title]
[A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss and counter by providing benefits of high-ticket advisory services, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


2. [Objection 2 title]
[A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss and counter by providing benefits of high-ticket advisory services, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


3. [Objection 3 title]
[A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss and counter by providing benefits of high-ticket advisory services, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


4. [Objection 4 title]
[A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss and counter by providing benefits of high-ticket advisory services, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


5. [Objection 5 title]
[A comprehensive explanation of the objection. Must include real-world client concerns. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss and counter by providing benefits of high-ticket advisory services, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


### GOALS

1. [Goal 1 title]
[A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services help attain the goal, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


2. [Goal 2 title]
[A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services help attain the goal, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


3. [Goal 3 title]
[A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services help attain the goal, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


4. [Goal 4 title]
[A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services help attain the goal, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


5. [Goal 5 title]
[A comprehensive explanation of the goal. Must include desired real-world outcomes. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services help attain the goal, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


### VALUES

1. [Value 1 title]
[A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services align with this value, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


2. [Value 2 title]
[A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services align with this value, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


3. [Value 3 title]
[A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services align with this value, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


4. [Value 4 title]
[A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services align with this value, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


5. [Value 5 title]
[A comprehensive explanation of the value. Must include the impact on decision-making. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services align with this value, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


### DECISION-MAKING PROCESSES

1. [Decision-Making Process 1 title]
[A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services fit into this process, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


2. [Decision-Making Process 2 title]
[A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services fit into this process, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


3. [Decision-Making Process 3 title]
[A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services fit into this process, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


4. [Decision-Making Process 4 title]
[A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services fit into this process, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


5. [Decision-Making Process 5 title]
[A comprehensive explanation of the decision-making process. Must include stakeholders and timeframes. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services fit into this process, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


### INFLUENCES

1. [Influence 1 title]
[A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services can leverage this influence, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


2. [Influence 2 title]
[A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services can leverage this influence, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


3. [Influence 3 title]
[A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services can leverage this influence, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


4. [Influence 4 title]
[A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services can leverage this influence, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


5. [Influence 5 title]
[A comprehensive explanation of the influence. Must include how it shapes perceptions. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services can leverage this influence, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


### COMMUNICATION PREFERENCES

1. [Communication Preference 1 title]
[A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services can adapt to this preference, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


2. [Communication Preference 2 title]
[A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services can adapt to this preference, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


3. [Communication Preference 3 title]
[A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services can adapt to this preference, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]


4. [Communication Preference 4 title]
[A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services can adapt to this preference, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]

5. [Communication Preference 5 title]
[A comprehensive explanation of the communication preference. Must include frequency and content type preferences. Use paragraph and/or bullet points.]

**How Advisory Services Can Help**
[Comprehensively discuss how high-ticket advisory services can adapt to this preference, particularly how this is aligned, reflected or connected to any of the services the client wants to avail (mentioned above). Use paragraph and/or bullet points.]

---

IMPORTANT NOTE: Always refer to the services the client wants to avail (mentioned above) and contextualize your responses with it, as you may see fit and appropriate.

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
      
    } catch (modelError: Error | unknown) {
      console.error(`Error with model ${model}:`, modelError);
      lastError = `Error with model ${model}: ${(modelError instanceof Error) ? modelError.message : String(modelError)}`;
      continue; // Try the next model
    }
  }
  
  // If we've tried all models and still don't have a response, throw the last error
  if (!responseData) {
    throw new Error(lastError || 'All models failed');
  }

  return responseData.choices[0].message.content;
}

// Helper function to generate combined research from all segments
function generateCombinedResearch(segments: Array<SegmentData & { deepResearch?: string }>): string {
  // Generate a combined analysis that synthesizes insights from all segments
  const segmentNames = segments.map(s => s.name).join(', ');
  
  return `
# Combined Segment Analysis

## Overview of Target Segments
This analysis covers the following segments: ${segmentNames}

## Common Themes Across Segments
${segments.map(s => `
### ${s.name}
${s.deepResearch?.substring(0, 300) || 'No deep research available'}...
`).join('\n')}

## Comparative Analysis
The segments analyzed represent different aspects of the target market, each with unique characteristics and needs.

## Strategic Recommendations
Based on the deep research of these segments, a multi-faceted marketing approach is recommended.
`;
}

// Helper function to format segments for display
function formatSegmentsForDisplay(segments: Array<SegmentData & { deepResearch?: string }>): string {
  return segments.map((segment) => {
    return `
${segment.deepResearch || 'No deep research available'}
`;
  }).join('\n\n');
}