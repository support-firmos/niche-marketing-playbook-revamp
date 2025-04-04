import { DeepResearchSegment } from '../store/deepResearchStore2';

export function formatDeepResearchForDisplay(segments: DeepResearchSegment[]): string {
  return segments.map(segment => {
    return `
# DEEP SEGMENT RESEARCH: ${segment.name}

## FEARS
${formatSection(segment.fears)}

## PAINS
${formatSection(segment.pains)}

## OBJECTIONS
${formatSection(segment.objections)}

## GOALS
${formatSection(segment.goals)}

## VALUES
${formatSection(segment.values)}

## DECISION-MAKING PROCESSES
${formatSection(segment.decisionMaking)}

## INFLUENCES
${formatSection(segment.influences)}

## COMMUNICATION PREFERENCES
${formatSection(segment.communicationPreferences)}
`;
  }).join('\n\n---\n\n');
}

function formatSection(items: Array<{ title: string; explanation: string; scenario: string; advisoryHelp: string }>) {
  return items.map((item, index) => `
${index + 1}. ${item.title}
  **Why**
   ${item.explanation}

   **Scenario**
   ${item.scenario}

   **How Advisory Services Can Help**
   ${item.advisoryHelp}
`).join('\n');
}