
import { NextResponse } from 'next/server';
import {Segment} from '@/app/store/salesNavSegmentsStore';

export const maxDuration = 60;
export const runtime = 'edge';

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
          "Headcount_test": segment.headcount,
          "CompanyType_test": segment.companytype,
          "Keywords": segment.keywords,
          //boolean: segment.boolean,
          "Other Intent Data": segment.intentdata,
        }
      }));

      //const requestBody = { records: records };

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