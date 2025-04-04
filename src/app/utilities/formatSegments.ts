import { DeepResearchSegment } from '@/app/store/deepResearchStore2';

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
    deepResearch?: DeepResearchSegment;
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
      
      let deepResearchSection = '';
      if (segment.deepResearch) {
        const research = segment.deepResearch;
        deepResearchSection = `
**E. Deep Research Insights**

**Fears:**
${research.fears.map(fear => `- ${fear.title}\n  ${fear.explanation}\n  ${fear.scenario}\n  Advisory Help: ${fear.advisoryHelp}`).join('\n\n')}

**Pains:**
${research.pains.map(pain => `- ${pain.title}\n  ${pain.explanation}\n  ${pain.scenario}\n  Advisory Help: ${pain.advisoryHelp}`).join('\n\n')}

**Objections:**
${research.objections.map(obj => `- ${obj.title}\n  ${obj.explanation}\n  ${obj.scenario}\n  Advisory Help: ${obj.advisoryHelp}`).join('\n\n')}

**Goals:**
${research.goals.map(goal => `- ${goal.title}\n  ${goal.explanation}\n  ${goal.scenario}\n  Advisory Help: ${goal.advisoryHelp}`).join('\n\n')}

**Values:**
${research.values.map(value => `- ${value.title}\n  ${value.explanation}\n    ${value.scenario}\n  Advisory Help: ${value.advisoryHelp}`).join('\n\n')}

**Decision Making:**
${research.decisionMaking.map(decision => `- ${decision.title}\n  ${decision.explanation}\n    ${decision.scenario}\n  Advisory Help: ${decision.advisoryHelp}`).join('\n\n')}

**Influences:**
${research.influences.map(influence => `- ${influence.title}\n  ${influence.explanation}\n    ${influence.scenario}\n  Advisory Help: ${influence.advisoryHelp}`).join('\n\n')}

**Communication Preferences:**
${research.communicationPreferences.map(comm => `- ${comm.title}\n  ${comm.explanation}\n    ${comm.scenario}\n  Advisory Help: ${comm.advisoryHelp}`).join('\n\n')}
`;
      }
      
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
${deepResearchSection}
  
  `;
    }).join('\n\n');
  }