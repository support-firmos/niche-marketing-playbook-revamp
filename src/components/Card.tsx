'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { SegmentResearch } from '@/app/store/deepResearchStore';

interface CardProps {
  title: string;
  data: string | null | undefined | SegmentResearch;
  onSendToApi?: () => Promise<void>;
  isLoading?: boolean;
  clientPicked: boolean;
}

export default function Card({ title, data, onSendToApi, isLoading = false, clientPicked = false }: CardProps) {
  return (
    <div className="bg-transparent rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <button
          onClick={onSendToApi}
          disabled={isLoading || !data || !clientPicked }
          className={`px-4 py-2 rounded-md ${
            isLoading || !data || !clientPicked
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          } transition duration-200`}
        >
          {isLoading ? 'Sending...' : 'Upload to Airtable'}
        </button>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-md max-h-80 overflow-auto">
        {data ? (
          typeof data === 'string' ? (
            <div className="text-gray-200 font-inter text-sm markdown-content">
              <ReactMarkdown 
                components={{
                  // This ensures paragraphs have proper spacing
                  p: ({...props}) => <p className="mb-4" {...props} />,
                  // Preserve newlines within paragraphs
                  br: () => <br />,

                  h1: ({...props}) => <h1 className="text-xl font-bold mb-4" {...props} />,
                  h2: ({...props}) => <h2 className="text-lg font-bold mb-3" {...props} />,
                  h3: ({...props}) => <h3 className="text-md font-bold mb-2" {...props} />,
                  // Custom styling for lists
                  ul: ({...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                  li: ({...props}) => <li className="mb-1" {...props} />,
                }}
              >
                {/* Convert single newlines to break tags for proper rendering */}
                {data.replace(/\n(?!\n)/g, '  \n')}
              </ReactMarkdown>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-gray-200">
              {JSON.stringify(data, null, 2)}
            </pre>
          )
        ) : (
          <p className="text-gray-400 italic">No data available</p>
        )}
      </div>
    </div>
  );
}