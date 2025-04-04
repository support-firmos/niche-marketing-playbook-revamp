import { NextResponse } from 'next/server';
import {Segment} from '@/app/store/salesNavSegmentsStore';

export const maxDuration = 60;
export const runtime = 'edge';

interface DeepResearchItem {
  title: string;
  explanation: string;
  scenario: string;
  advisoryHelp: string;
}

function formatDeepResearchArray(arr: DeepResearchItem[] | undefined): string {
  if (!Array.isArray(arr)) return '';
  return arr.map(item => 
    `Title: ${item.title}\nExplanation: ${item.explanation}\n\nScenario:  ${item.scenario}\n\nAdvisory Help: ${item.advisoryHelp}`
  ).join('\n\n');
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { data, clientID, tableID } = requestData;
    const segments = data || [];

    const records = segments.map((segment: Segment) => ({
        fields: {
          "Segments": segment.name,
          "Justification and Logic": segment.justification,
          //challenges: segment.challenges,
          "Sales Nav Job Titles": segment.jobtitles,
          "Sales Nav Industries": segment.industries,
          "Headcount": segment.headcount,
          "Company Type": segment.companytype,
          "Keywords": segment.keywords,
          //boolean: segment.boolean,
          "Other Intent Data": segment.intentdata,
          "Fears": formatDeepResearchArray(segment.deepResearch?.fears),
          "Pains": formatDeepResearchArray(segment.deepResearch?.pains),
          "Objections": formatDeepResearchArray(segment.deepResearch?.objections),
          "Goals": formatDeepResearchArray(segment.deepResearch?.goals),
          "Values": formatDeepResearchArray(segment.deepResearch?.values),
          "Decision Making Process": formatDeepResearchArray(segment.deepResearch?.decisionMaking),
          "Influences": formatDeepResearchArray(segment.deepResearch?.influences),
          "Communication Preferences": formatDeepResearchArray(segment.deepResearch?.communicationPreferences)
        }
      }));

    if (!segments) {
      return NextResponse.json({ error: 'No information' }, { status: 400 });
    }

    // Send to Airtable
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${clientID}/${tableID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({records})
      });
      
      const airtableData = await airtableResponse.json();
      console.log(airtableData);
      return NextResponse.json({ 
        success: true,
        message: 'Data processed successfully',
        results: airtableData
      });
      
    } catch (error) {
      console.error('Error processing data:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to process data', error },
        { status: 500 }
      );
    }
}