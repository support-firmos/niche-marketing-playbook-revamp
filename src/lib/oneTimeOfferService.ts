/**
 * Server-side service for generating one-time offers.
 * This file should only be imported and used from server components or API routes.
 * Environment variables like OPENROUTER_API_KEY are only accessible server-side.
 */
export async function generateOneTimeOffer(text: string): Promise<string> {
  try {
    // Try to extract the industry from the text
    const industry = extractIndustry(text) || "your";
    
    // Log server-side information
    console.log('Server: Generating one-time offer for industry:', industry);
    
    // Create the prompt with the improved format
    const prompt = `
IMPORTANT: Format your entire response using proper Markdown syntax. Begin your response EXACTLY with "# Introduction to One-Time Offers" - do NOT include any preamble, introduction, or explanation before this title.

Please carefully analyze this provided Inbound Marketing Blueprint for a specific industry:
${text}

Use this to inform your creation of industry-specific one-time offers. Based on your analysis, create a comprehensive One-Time Offer (OTO) strategy document for the ${industry} industry that follows the exact markdown format specified below.

STEP 1: INDUSTRY ANALYSIS (do not include this heading in your response)
First, thoroughly examine the provided Inbound Marketing Blueprint to identify:
- The primary industry and any sub-industries or specializations
- Key terminology, jargon, and industry-specific language
- Major pain points, challenges, and needs in this industry
- Common services, products, or solutions in this market
- Typical business models and customer relationships
- Regulatory or compliance considerations

STEP 2: DOCUMENT CREATION (start your response with this section using markdown)
Begin the document with this introduction, formatted in markdown:

# Introduction to One-Time Offers

One-Time Offers (OTOs) serve as a dynamic strategy for companies aiming to convert prospective clients. By presenting a limited-time, irresistible deal, these offers reduce the risk for new customers, allowing them to experience your product or service with minimal commitment. This agile approach builds trust and sparks immediate engagement.

## Key benefits of implementing one-time offers include:
- **Accelerated Revenue Streams:** Quickly transform cautious leads into loyal customers through compelling, time-sensitive deals.
- **Optimized Conversion Metrics:** Lower entry barriers to boost conversion rates and enhance customer engagement.
- **Distinct Market Positioning:** Differentiate your brand by delivering a unique, low-risk value proposition in a competitive landscape.
- **Sustainable Customer Relationships:** Establish a solid foundation for long-term loyalty with clear, upfront value.

One-time offers provide an ideal platform to highlight exceptional service quality and address specific client needs. By tailoring these offers to leverage your company's unique strengths, you can effectively demonstrate value, drive urgency, and set the stage for scalable growth. The upcoming sections of this report will showcase bespoke examples of one-time offers that integrate seamlessly into your outbound campaigns, illustrating practical applications and measurable outcomes.

---

STEP 3: ONE-TIME OFFER CREATION
For each of the 10 one-time offers, follow this exact markdown format with proper spacing and formatting:

### 1. [Title of Offer that uses industry-specific terminology]

**What It Is:** [A concise explanation of the deliverable that provides clear value to businesses in the ${industry} industry]

**Why It Works:** [Explanation focusing on how this addresses a specific pain point you identified in the ${industry} industry - describe the challenge directly without citing or referencing where you found it]

**What's Required:**
- [Minimal required item 1 - keep this very low friction and industry-appropriate]
- [Minimal required item 2 - if necessary, using industry terminology]

**Deliverables:**
- [Specific deliverable 1 - use concrete, tangible outputs relevant to the industry]
- [Specific deliverable 2 - incorporate terminology from the provided text]
- [Specific deliverable 3 - if applicable, focus on solving a key pain point]

**Standardization Approach:**
- [Method 1 for scaling/standardizing this offer - industry-specific]
- [Method 2 for scaling/standardizing this offer - reference relevant tools/systems]
- [Method 3 for scaling/standardizing this offer - if applicable]

---

## Important requirements to follow:

1. IMPORTANT NOTE: Each offer must be overarching the industry being pertained in the blueprint, thus, make it general and universal. Strictly take note that each offer must be general and not specific to a particular segment in that industry.

2. Apply the "Armor Piercing Approach" (from the book "4 conversations") - each offer should be something specific and personalized to the client that impresses them and creates a great client experience. Use language, examples, and terminology directly from the provided text.

3. Follow Jason Staats' notes on starting with a standalone project:
   - Attract higher quality clients with limited scope projects
   - Don't require prospects to leave their current provider
   - Do one specific thing exceptionally well to impress them
   - Screen clients to determine if you want to work with them long-term
   - This approach leads to 20-40% higher monthly recurring revenue

4. Each offer must:
   - Be overarching the industry being pertained in the blueprint, thus, make it general and universal. Strictly take note that each offer must be general and not specific to a particular segment in that industry.
   - Be standardizable to minimize upfront work (utilize templates and systems common in the ${industry} industry)
   - Deliver maximum perceived value to the target audience by addressing specific pain points identified in the provided text
   - Be priced between $299-$899
   - Include a money-back guarantee if they don't save or earn more than what they paid
   - Include genuine service/customization (not just templates)
   - Require minimal information from prospects (optimize for low friction)
   - Solve a specific pain point in the ${industry} industry that you've identified from the provided text

5. Ensure the document follows the exact markdown formatting shown in the example, with:
   - Proper markdown headers (# for main title, ## for sections, ### for subsections)
   - Consistent use of markdown lists (- for bullet points)
   - Bold text (**text**) for section titles within offers
   - Clean, professional formatting throughout with proper spacing
   - Numbered offers (1 through 10) using markdown headers (### 1., ### 2., etc.)

6. Industry Specificity and Output Format Requirements:
   - Incorporate at least 3-5 industry-specific terms or phrases from the provided text in each offer
   - Address actual challenges, tools, regulations, or methodologies mentioned in the text without explicitly citing them
   - Ensure each offer title clearly signals its relevance to the ${industry} industry
   - Do not include any source citations, references to sections, or mention where you found the information (e.g., no phrases like "Referencing PAIN POINTS-1" or similar)
   - Use examples that would be immediately recognized as relevant by professionals in this industry
   - After the final offer, include a single line of text stating that all offers are priced between $299-$899 and include a money-back guarantee

IMPORTANT NOTE: Again, each offer must be overarching the industry being pertained in the blueprint, thus, make it general and universal. Strictly take note that each offer must be general and not specific to a particular segment in that industry.
Please create all 10 offers following this markdown structure exactly, ensuring they address real pain points that companies in this space experience.
`;

    // Try with different models if the first one fails - same approach as other route.ts files
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
        console.log(`Trying model: ${model} for one-time offer generation`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://market-segment-generator.vercel.app/',
            'X-Title': 'One-Time Offer Generator',
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
    
    // If we've tried all models and still don't have a response, throw the last error
    if (!responseData) {
      throw new Error(lastError || 'All models failed');
    }
    
    // Extract the content from the response
    return responseData.choices[0].message.content;
    
  } catch (error) {
    console.error('Error generating one-time offer:', error);
    // Fallback to simulated response in case of an error
    return simulateGptResponse(text);
  }
}

// Helper function to extract industry from text
function extractIndustry(text: string): string | null {
  try {
    // Extract meaningful industry information directly from the text
    // Look for patterns like "in the X industry" or similar phrases
    let industryMatch = text.match(/(?:in|for|within|across)\s+the\s+([a-z\s-]+)\s+(?:industry|sector|market|field|niche|business)/i);
    
    if (!industryMatch) {
      // Try other patterns like "X industry challenges" or "X industry trends"
      industryMatch = text.match(/([a-z\s-]+)\s+(?:industry|sector|market|field|niche|business)\s+(?:challenges|trends|solutions|problems|needs)/i);
    }
    
    if (!industryMatch) {
      // Look for any mention of "industry" and grab the preceding words
      industryMatch = text.match(/([a-z\s-]{3,30})\s+(?:industry|sector|market)/i);
    }
    
    // Clean up and return the extracted industry
    if (industryMatch && industryMatch[1]) {
      const industry = industryMatch[1].trim().toLowerCase();
      // Only return if it seems like a valid industry name (not too short)
      if (industry.length > 2) {
        return industry;
      }
    }
    
    // If no good match is found, return null and let the calling function handle the default
    return null;
  } catch (error) {
    console.error('Error extracting industry:', error);
    return null;
  }
}

// Fallback function for simulated response
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function simulateGptResponse(text: string): string {
  return `# Introduction to One-Time Offers

One-Time Offers (OTOs) serve as a dynamic strategy for companies aiming to convert prospective clients. By presenting a limited-time, irresistible deal, these offers reduce the risk for new customers, allowing them to experience your product or service with minimal commitment. This agile approach builds trust and sparks immediate engagement.

## Key benefits of implementing one-time offers include:
- **Accelerated Revenue Streams:** Quickly transform cautious leads into loyal customers through compelling, time-sensitive deals.
- **Optimized Conversion Metrics:** Lower entry barriers to boost conversion rates and enhance customer engagement.
- **Distinct Market Positioning:** Differentiate your brand by delivering a unique, low-risk value proposition in a competitive landscape.
- **Sustainable Customer Relationships:** Establish a solid foundation for long-term loyalty with clear, upfront value.

One-time offers provide an ideal platform to highlight exceptional service quality and address specific client needs. By tailoring these offers to leverage your company's unique strengths, you can effectively demonstrate value, drive urgency, and set the stage for scalable growth. The upcoming sections of this report will showcase bespoke examples of one-time offers that integrate seamlessly into your outbound campaigns, illustrating practical applications and measurable outcomes.

---

### 1. [Financial Health Check for Small Businesses]

**What It Is:** A comprehensive assessment of your business's financial status, identifying key areas for improvement in cash flow, profitability, and financial management practices.

**Why It Works:** Many small businesses struggle with maintaining proper financial visibility, making it difficult to make informed decisions. This offer provides immediate clarity on financial position and practical steps to improve it.

**What's Required:**
- 3 months of financial statements
- Brief questionnaire about business goals

**Deliverables:**
- Detailed financial health report with key metrics and benchmarks
- Prioritized list of action items to improve financial performance
- 45-minute consultation to review findings and recommendations

**Standardization Approach:**
- Standardized financial analysis template and ratios
- Automated data processing tools to extract key financial information
- Library of common recommendations based on industry benchmarks

---

[Content for remaining 9 offers would be here in the same format]

All offers are priced between $299-$899 and include a money-back guarantee if you don't save or earn more than what you paid.`;
}