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
      const result = JSON.parse(cleaned);
      
      // Check if result is empty object or array when it shouldn't be
      if ((Array.isArray(result) && result.length === 0) || 
          (!Array.isArray(result) && Object.keys(result).length === 0)) {
        console.warn("Warning: JSON parsed successfully but resulted in empty data");
      }
      
      return result;
    } catch (firstError) {
      try {
        // If that fails, try handling any escaped characters properly
        cleaned = cleaned.replace(/\\n/g, '\n')
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\');
        return JSON.parse(cleaned);
      } catch (secondError) {
        // Third approach: try parsing after removing any "real" newlines 
        try {
          const compactCleaned = cleaned.replace(/\n\s*/g, ' ');
          return JSON.parse(compactCleaned);
        } catch (thirdError) {
          // If all approaches fail, provide a detailed error
          console.error("JSON parsing failed. Content sample:", cleaned.substring(0, 100) + "...");
          throw new Error(`Failed to parse JSON: ${firstError}`);
        }
      }
    }
  }