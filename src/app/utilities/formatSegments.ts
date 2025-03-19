// Format segments into human-readable text for display
export function formatSegmentsForDisplay(segments: Array<{
    name: string;
    justification: string;
    challenges: string;
    jobtitles: string;
    industries: string;
    headcount: string;
    companytype: string;
    keywords: string;
    boolean: string;
    intentdata: string;
  }>): string {
    if (!segments || segments.length === 0) {
      return "No segments available";
    }
    
    return segments.map((segment, index) => {
      const name = segment.name || `Segment ${index + 1}`;
      const justification = segment.justification || '';
      const challenges = segment.challenges || '';
      const jobtitles = segment.jobtitles || '';
      const industries = segment.industries || '';
      const headcount = segment.headcount || '';
      const companytype = segment.companytype || '';
      const keywords = segment.keywords || '';
      const boolean = segment.boolean || '';
      const intentdata = segment.intentdata || '';
      
      return `
---
## SEGMENT ${index + 1}: ${name}
  
**A. Why This Segment?**
${justification}
  
**B. Key Challenges:**
${challenges}
  
**C. Sales Navigator Filters:**
  
**Job Titles (Business Decision-Makers & Leaders)**:
${jobtitles}

**Industries**
${industries}

**Company Headcount**
${headcount}

**Company Type**
${companytype}

**Keywords in Company Name**
${keywords}

**Boolean Search Query**
${boolean}
  
**D. Best Intent Data Signals**
${intentdata}
  
  `;
    }).join('\n\n');
  }