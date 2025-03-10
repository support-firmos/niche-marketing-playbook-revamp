// src/app/api/generate-segments/route.ts
import { NextResponse } from 'next/server';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Edge runtime for better performance with long-running requests
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { segmentInfo } = await request.json();
    
    if (!segmentInfo || typeof segmentInfo !== 'string') {
      return NextResponse.json({ error: 'Invalid segment information' }, { status: 400 });
    }
    // Modified section of the prompt in src/app/api/generate-segments/route.ts
    const prompt = `
    You are a specialized LinkedIn Sales Navigator outreach strategist with deep expertise in B2B targeting and account-based marketing. Your task is to transform the segment information below into a structured LinkedIn Sales Navigator targeting strategy for fractional CFO services.

    FORMAT YOUR RESPONSE AS A JSON ARRAY OF OBJECTS, where each object represents a segment with two attributes, namely name and content:
    [
      {
        "name": "segment name here",
        "content":
          "
            Why This Segment?
            [3-5 sentences explaining why this segment needs fractional CFO services. Provide specific business context, industry challenges, and financial pain points. Detail how their size, growth stage, and business model create a need for sophisticated financial leadership without the cost of a full-time CFO. Explain their complexity and why they're particularly suited for fractional services.]
        
            Key Challenges:
            👉 [Challenge 1]—[Detailed explanation of the challenge with specific examples and business implications]
            👉 [Challenge 2]—[Detailed explanation of the challenge with specific examples and business implications]
            👉 [Challenge 3]—[Detailed explanation of the challenge with specific examples and business implications]
            👉 [Challenge 4]—[Detailed explanation of the challenge with specific examples and business implications]
        
            🎯 Sales Navigator Filters:
            ✅ Job Titles (Business Decision-Makers & Leaders):
            [List 20-30 non-finance job titles, one per line, focusing on business owners, executives, and operational leadership who would make decisions about hiring financial services. Include multiple variants of similar roles (Owner, Co-Owner, Founder, Co-Founder, etc.)]
            Examples:
            Owner
            Co-Owner
            Founder
            Co-Founder
            CEO
            President
            Managing Director
            Managing Partner
            Partner
            Director
            Executive Director
            Chief Operating Officer
            COO
            VP of Operations
            General Manager
                
            ✅ Industry:
            [List 3-5 industry categories, one per line]
                
            ✅ Company Headcount:
            [Specify employee range using LinkedIn's standard brackets: 11-50, 51-200, 201-500, etc.]
                
            ✅ Company Type:
            [List company types, one per line]
                
            ✅ Keywords in Company Name:
            [List relevant keywords in quotation marks]
                
            ✅ Boolean Search Query:
            [Provide a sample boolean search string using OR operators]
                
            Best Intent Data Signals
            🔹 [Signal 1] (Detailed explanation with specific business implications)
            🔹 [Signal 2] (Detailed explanation with specific business implications)
            🔹 [Signal 3] (Detailed explanation with specific business implications)
            🔹 [Signal 4] (Detailed explanation with specific business implications)
          "
      },
      {...same format above for the next segments}
    ]

    IMPORTANT INSTRUCTIONS:
    - Format your ENTIRE response as a valid JSON array that can be parsed with JSON.parse()
    - Do NOT include any text before or after the JSON
    - Please provide a valid JSON response without markdown formatting or additional text.
    - Maintain the exact structure shown above
    - Use the exact emoji formatting shown above (1️⃣, 👉, 🎯, ✅, 🔹)
    - Do NOT include any introductory text, disclaimers, or conclusions
    - Start immediately with "1️⃣" and the first segment name
    - Extract and transform information from the provided segment analysis
    - Focus on creating practical Sales Navigator targeting parameters
    - For Job Titles: Do NOT include finance roles (CFO, Finance Director, Controller, etc.) since these positions would NOT hire fractional CFO services. Instead, focus on business leaders/owners who would make these decisions.
    - Include a diverse range of job title variants to maximize the total addressable market
    - Provide in-depth, detailed explanations for "Why This Segment?" and "Key Challenges" sections
    - End after completing the last segment with no closing remarks

    ${segmentInfo.substring(0, 20000)}
    `;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://market-segment-generator.vercel.app/',
        'X-Title': 'LinkedIn Sales Navigator Targeting',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        max_tokens: 20000,
        temperature: 1,
      }),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('OpenRouter error response:', responseText);
      return NextResponse.json({ 
        error: `OpenRouter API error: ${response.status}`,
        details: responseText
      }, { status: 500 });
    }
    
    try {
      const data = JSON.parse(responseText);
      if (!data.choices?.[0]?.message) {
        return NextResponse.json({ 
          error: 'Invalid response format from OpenRouter',
          details: responseText 
        }, { status: 500 });
      }
      
      const content = data.choices[0].message.content;
      
      // More aggressive cleaning of the content to handle various LLM formatting issues
      let cleanedContent = content;
      
      // Remove any markdown code blocks (with or without language specifier)
      if (cleanedContent.includes('```')) {
        // Handle ```json blocks
        cleanedContent = cleanedContent.replace(/```json\n/g, '').replace(/\n```/g, '');
        // Handle ``` blocks without language specifier
        cleanedContent = cleanedContent.replace(/```\n/g, '').replace(/\n```/g, '');
        // Handle any remaining ``` markers (no newlines)
        cleanedContent = cleanedContent.replace(/```/g, '');
      }
      
      // Remove any text before the first [ and after the last ]
      const jsonStartIndex = cleanedContent.indexOf('[');
      const jsonEndIndex = cleanedContent.lastIndexOf(']');
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        cleanedContent = cleanedContent.substring(jsonStartIndex, jsonEndIndex + 1);
      }
      
      // Fix common JSON formatting issues
      // Replace single quotes with double quotes (if they're used for JSON properties)
      cleanedContent = cleanedContent.replace(/'([^']+)':/g, '"$1":');
      
      console.log('Cleaned content:', cleanedContent.substring(0, 100) + '...');
      
      // Try to parse the content as JSON
      try {
        // This will throw if content is not valid JSON
        const parsedSegments = JSON.parse(cleanedContent);
        
        // Create a more consistent readable text format for display
        let readableContent = '';
        
        if (Array.isArray(parsedSegments)) {
          parsedSegments.forEach((segment, index) => {
            if (segment.name && segment.content) {
              // Add segment name as a header with consistent formatting
              readableContent += `${index + 1}. ${segment.name.toUpperCase()}\n`;
              readableContent += '='.repeat(segment.name.length + 4) + '\n\n';
              
              // Process the content to ensure proper formatting
              let formattedContent = segment.content.trim();
              
              // Standardize section formatting with consistent spacing
              const sections = [
                { pattern: /Why This Segment\?/g, title: 'Why This Segment?', length: 18 },
                { pattern: /Key Challenges:/g, title: 'Key Challenges:', length: 15 },
                { pattern: /🎯 Sales Navigator Filters:/g, title: '🎯 Sales Navigator Filters:', length: 25 },
                { pattern: /Best Intent Data Signals/g, title: 'Best Intent Data Signals', length: 24 }
              ];
              
              // Apply consistent formatting to each section
              sections.forEach(section => {
                formattedContent = formattedContent.replace(
                  section.pattern,
                  `\n${section.title}\n${'-'.repeat(section.length)}\n`
                );
              });
              
              // Ensure emoji consistency
              formattedContent = formattedContent.replace(/👉/g, '👉 '); // Ensure space after emoji
              formattedContent = formattedContent.replace(/✅/g, '✅ '); // Ensure space after emoji
              formattedContent = formattedContent.replace(/🔹/g, '🔹 '); // Ensure space after emoji
              
              // Fix any double spacing issues
              formattedContent = formattedContent.replace(/\s{3,}/g, '\n\n');
              
              // Add the formatted content
              readableContent += formattedContent + '\n\n';
              
              // Add consistent separator between segments
              if (index < parsedSegments.length - 1) {
                readableContent += '\n' + '*'.repeat(50) + '\n\n';
              }
            }
          });
        }
        
        // Ensure we have valid readable content
        const finalReadableContent = readableContent.trim() || JSON.stringify(parsedSegments, null, 2);
        
        // Log the final content length to help with debugging
        console.log(`Final content length: ${finalReadableContent.length} characters`);
        
        // Return both the readable text for display and structured data for segment selection
        return NextResponse.json({
          result: finalReadableContent, // Readable text or fallback to JSON
          segments: parsedSegments, // Structured data for segment selection
          format: readableContent.trim() ? 'formatted' : 'json' // Indicate which format was used
        });
      } catch (jsonError) {
        console.error('Error parsing LLM response as JSON:', jsonError);
        
        // Try to extract anything that looks like JSON from the content
        let extractedJson = '';
        // Use a regex that's compatible with the current TypeScript configuration
        // Instead of /s flag (which requires ES2018+), use [\s\S]* to match any character including newlines
        const jsonMatch = cleanedContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          extractedJson = jsonMatch[0];
          console.log('Extracted potential JSON:', extractedJson.substring(0, 100) + '...');
          
          try {
            // Try to parse the extracted JSON
            const extractedSegments = JSON.parse(extractedJson);
            console.log('Successfully parsed extracted JSON');
            
            return NextResponse.json({
              result: JSON.stringify(extractedSegments, null, 2),
              segments: extractedSegments,
              format: 'json',
              warning: 'Used fallback JSON extraction'
            });
          } catch (extractError) {
            console.error('Failed to parse extracted JSON:', extractError);
          }
        }
        
        // Format the raw content for better display
        const formattedContent = content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        // Create a fallback segment from the raw content
        const fallbackSegments = [{
          name: "Generated Segment (Parsing Error)",
          content: formattedContent.substring(0, 1000) // Limit content length
        }];
        
        // If all parsing fails, return the formatted raw content with fallback segments
        return NextResponse.json({
          result: formattedContent,
          segments: fallbackSegments, // Provide at least one segment for selection
          error: 'Failed to parse LLM response as JSON. Returning formatted raw content.',
          format: 'raw'
        });
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return NextResponse.json({ 
        error: 'Failed to parse API response',
        details: responseText 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating segments:', error);
    return NextResponse.json({ 
      error: 'Failed to generate strategy',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}