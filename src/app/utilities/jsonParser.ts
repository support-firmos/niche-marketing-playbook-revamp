export function parseJSON(content: string) {
    // First remove markdown code block delimiters if present
    let cleaned = content.replace(/```json|```/g, '').trim();
    
    try {
      // Try standard parsing first
      return JSON.parse(cleaned);
    } catch (e) {
      try {
        // If that fails, try handling any escaped characters properly
        // This helps with cases where \n appears as a literal string
        cleaned = cleaned.replace(/\\n/g, '\n')
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\');
        return JSON.parse(cleaned);
      } catch (error) {
        // If both approaches fail, provide a more helpful error
        console.error("JSON parsing failed:", error);
        throw new Error("Could not parse JSON content. Please check the format.");
      }
    }
  }