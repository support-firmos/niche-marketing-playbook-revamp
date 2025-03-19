

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

## Audience Approach
${audience}

---

## Pain Points
${pain}

---

## Fear Mitigation
${fear}

---

## Goals
${goals}

---

## Objection Handling
${objection}

---

## Core Value Proposition
${value}

---

## Decision-making Framework
${decision}

---

## Metrics and KPIs
${metrics}

---

## Communication Stragey
${communication}

---

## Content Framework
${content}

---

## Lead Magnets
${lead}
  `;
    }).join('\n\n');
  }