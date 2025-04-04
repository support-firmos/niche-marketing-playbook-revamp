

export function formatPlaybookForDisplay(playbook: Array<{
  title: string;
  audience: string;
  pain: string;
  fear: string;
  goals: string;
  objection: string;
  value: string;
  decision: string;
  metrics: string;
  communication: string;
  content: string;
  lead: string;
}>): string {
  if (!playbook || playbook.length === 0) {
    return "No playbook available";
  }

    return playbook.map((playbk) => {
      const title = playbk.title || '';
      const audience = playbk.audience || '';
      const pain = playbk.pain || '';
      const fear = playbk.fear || '';
      const goals = playbk.goals || '';
      const objection = playbk.objection || '';
      const value = playbk.value || '';
      const decision = playbk.decision || '';
      const metrics = playbk.metrics || '';
      const communication = playbk.communication || '';
      const content = playbk.content || '';
      const lead = playbk.lead || '';
      
      return `
# ${title}

---

## Target Audience
${audience}

---

## Pain Points
${pain}

---

## Fears and Concerns
${fear}

---

## Goals
${goals}

---

## Objections
${objection}

---

## Core Values
${value}

---

## Decision-making Process
${decision}

---

## Key Metrics
${metrics}

---

## Communication Preferences
${communication}

---

## Content Tone and Style
${content}

---

## Lead Magnet Titles
${lead}
  `;
    }).join('\n\n');
  }