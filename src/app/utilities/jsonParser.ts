export function parseJSON(content: string) {
  // Guard clause for empty input
  if (!content || content.trim() === '') {
    throw new Error("Empty content provided to JSON parser");
  }

  // First remove markdown code block delimiters if present
  let cleaned = content.replace(/```json|```/g, '').trim();
  
  // Check if we actually have content after cleaning
  if (!cleaned || cleaned.trim() === '') {
    throw new Error("No JSON content found after removing markdown delimiters");
  }
  
  try {
    // Try standard parsing first
    return JSON.parse(cleaned);
  } catch (firstError) {
    console.log(`Standard parsing failed: ${firstError}`);
    
    try {
      // Better handling of escaped characters and whitespace normalization
      cleaned = cleaned
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        // Handle inconsistent whitespace in multiline strings
        .replace(/\n\s+/g, '\n');
        
      return JSON.parse(cleaned);
    } catch (secondError) {
      console.log("Handling escaped characters failed:", secondError);
      
      try {
        // More aggressive approach: normalize all whitespace
        const compactCleaned = cleaned
          .replace(/\s+/g, ' ')  // Replace all whitespace sequences with single space
          .replace(/"\s+/g, '"') // Remove spaces after quotes
          .replace(/\s+"/g, '"'); // Remove spaces before quotes
          
        return JSON.parse(compactCleaned);
      } catch (thirdError) {
        console.log("Compacting content failed:", thirdError);
        
        try {
          // Final attempt: try a more relaxed JSON parsing approach
          // This could use a library like json5 or a custom implementation
          // For this example, we'll implement a simple fix for common issues
          
          // Fix unquoted property names (if present)
          const propertyFixedJSON = cleaned.replace(/(\w+):/g, '"$1":');
          
          // Fix single quotes (if present)
          const quoteFixedJSON = propertyFixedJSON.replace(/'/g, '"');
          
          // Try parsing after these repairs
          return JSON.parse(quoteFixedJSON);
        } catch (fourthError) {
          // If all approaches fail, provide a detailed error
          console.error("JSON parsing failed after all attempts");
          console.error(`Content starts with: ${cleaned.substring(0, 100)}...`);
          console.error(`Content ends with: ${cleaned.substring(cleaned.length - 100)}...`);
          console.error(`Final error: ${fourthError}`);
          
          throw new Error("Failed to parse JSON content after multiple attempts");
        }
      }
    }
  }
}