
import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { data, firmOSTableID, firmOSBaseID, recordID } = requestData;
    const playbook = data || [];

    if (!playbook || playbook.length === 0) {
      return NextResponse.json({ error: 'No playbook information' }, { status: 400 });
    }

    const fields = {
      "Audience Approach": playbook[0].audience,
      "Pain Points": playbook[0].pain,
      "Fear Mitigation": playbook[0].fear,
      "Goals": playbook[0].goals,
      "Objection Handling": playbook[0].objection,
      "Core Value Proposition": playbook[0].value,
      "Decision-making Framework": playbook[0].decision,
      "Metrics and KPIs": playbook[0].metrics,
      "Communication Strategy": playbook[0].communication,
      "Content Framework": playbook[0].content,
      "Lead Magnets": playbook[0].lead
    };

    // Send to Airtable
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${firmOSBaseID}/${firmOSTableID}/${recordID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({fields})
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