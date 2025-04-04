'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { faArrowRight, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DeepResearchSegment } from '../store/deepResearchStore2';
import ReactMarkdown from 'react-markdown';

interface ResultProps {
    segments: DeepResearchSegment[] | null;
    onReset: () => void;
}

const formatSegmentToText = (segment: DeepResearchSegment) => {
    const formatSection = (items: Array<{ title: string; explanation: string; scenario: string; advisoryHelp: string }>, sectionName: string) => {
        return `\n## ${sectionName}\n\n` + items.map((item, index) => `
### ${index + 1}. ${item.title}

#### Why
${item.explanation.replace(/\n/g, '\n\n')}

### Scenario
${item.scenario.replace(/\n/g, '\n\n')}

#### How Advisory Services Can Help
${item.advisoryHelp.replace(/\n/g, '\n\n')}
`).join('\n---\n');
    };

    return `
# Deep Segment Research: ${segment.name}

${formatSection(segment.fears, 'Fears')}
${formatSection(segment.pains, 'Pains')}
${formatSection(segment.objections, 'Objections')}
${formatSection(segment.goals, 'Goals')}
${formatSection(segment.values, 'Values')}
${formatSection(segment.decisionMaking, 'Decision-Making Processes')}
${formatSection(segment.influences, 'Influences')}
${formatSection(segment.communicationPreferences, 'Communication Preferences')}
    `.trim();
};

export default function Result({ segments, onReset }: ResultProps) {
    const [openSegments, setOpenSegments] = useState<{ [key: string]: boolean }>({});
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
    const [copySuccess, setCopySuccess] = useState('');

    const toggleSegment = (segmentName: string) => {
        setOpenSegments(prev => ({
            ...prev,
            [segmentName]: !prev[segmentName]
        }));
    };

    const toggleSection = (segmentName: string, sectionName: string) => {
        const key = `${segmentName}-${sectionName}`;
        setOpenSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleCopy = async () => {
        if (!segments) return;
        try {
            const textContent = segments.map(formatSegmentToText).join('\n\n---\n\n');
            await navigator.clipboard.writeText(textContent);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch {
            setCopySuccess('Failed to copy');
        }
    };

    const handleDownload = () => {
        if (!segments) return;
        const content = segments.map(formatSegmentToText).join('\n\n---\n\n');
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'Deep-Segment-Research.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleCopySegment = async (segment: DeepResearchSegment) => {
        try {
            const textContent = formatSegmentToText(segment);
            await navigator.clipboard.writeText(textContent);
            setCopySuccess(`Copied!`);
            setTimeout(() => setCopySuccess(''), 2000);
        } catch {
            setCopySuccess('Failed to copy');
        }
    };
    
    const handleDownloadSegment = (segment: DeepResearchSegment) => {
        const content = formatSegmentToText(segment);
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Deep-Segment-Research-${segment.name}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const renderSection = (items: Array<{ title: string; explanation: string; scenario: string; advisoryHelp: string }>, 
        title: string, 
        segmentName: string) => {
const isOpen = openSections[`${segmentName}-${title}`];



return (
<div className="mb-6">
<button
   onClick={() => toggleSection(segmentName, title)}
   className="w-full p-3 flex justify-between items-center bg-gray-800 text-[#f7f8f8] hover:bg-slate-900 rounded-lg mb-2"
>
   <h3 className="text-lg font-semibold">{title}</h3>
   <FontAwesomeIcon 
       icon={isOpen ? faChevronUp : faChevronDown} 
       className="w-4 h-4"
   />
</button>

{isOpen && (
   <div className="space-y-4">
       {items.map((item, index) => (
           <div key={index} className="bg-gray-600/50 p-4 rounded-lg">
               <h4 className="font-medium strong mb-2">{item.title}</h4>
               <h4 className="font-medium mb-2 text-green-400">Why?</h4>
               <div className="prose prose-invert max-w-none">
                       <ReactMarkdown
                           components={{
                               p: ({...props}) => <p className="mb-4 text-gray-300" {...props} />,
                               ul: ({...props}) => <ul className="list-disc pl-6 mb-4 text-gray-300" {...props} />,
                               ol: ({...props}) => <ol className="list-decimal pl-6 mb-4 text-gray-300" {...props} />,
                               li: ({...props}) => <li className="mb-1" {...props} />,
                               strong: ({...props}) => <strong className="font-semibold text-green-400" {...props} />
                           }}
                       >
                           {item.explanation.replace(/\n/g, '  \n')}
                       </ReactMarkdown>
                   </div>
               <h4 className="font-medium mb-2 text-green-400">Real-World Scenario</h4>
               <p className="mb-3 text-gray-300">{item.scenario}</p>
               <div className="bg-gray-700/50 p-3 rounded">
                   <h5 className="font-medium mb-2 text-green-400">How Advisory Services Can Help</h5>
                   <div className="prose prose-invert max-w-none">
                       <ReactMarkdown
                           components={{
                               p: ({...props}) => <p className="mb-4 text-gray-300" {...props} />,
                               ul: ({...props}) => <ul className="list-disc pl-6 mb-4 text-gray-300" {...props} />,
                               ol: ({...props}) => <ol className="list-decimal pl-6 mb-4 text-gray-300" {...props} />,
                               li: ({...props}) => <li className="mb-1" {...props} />,
                               strong: ({...props}) => <strong className="font-semibold" {...props} />
                           }}
                       >
                           {item.advisoryHelp.replace(/\n/g, '  \n')}
                       </ReactMarkdown>
                   </div>
               </div>
           </div>
       ))}
   </div>
)}
</div>
);
};
return (
    <div className="space-y-6">          
        <div className="space-y-4">
            {segments?.map((segment, index) => (
                <div key={index} className="bg-gray-700 rounded-xl border border-[#8a8f98]/20">
                    <button
                        onClick={() => toggleSegment(segment.name)}
                        className="w-full p-4 flex justify-between items-center text-[#f7f8f8] hover:bg-gray-600 rounded-xl"
                    >
                        <span className="font-semibold">{segment.name}</span>
                        <FontAwesomeIcon 
                            icon={openSegments[segment.name] ? faChevronUp : faChevronDown} 
                            className="w-4 h-4"
                        />
                
                    </button>
                    <div className="flex gap-2 m-3">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => handleCopySegment(segment)}
                                className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
                            >
                                {copySuccess.includes(segment.name) ? copySuccess : 'Copy'}
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => handleDownloadSegment(segment)}
                                className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
                            >
                                Download
                            </Button>
                        </div>
                    {openSegments[segment.name] && (
                        <div className="p-4 border-t border-[#8a8f98]/20 text-[#f7f8f8]">
                            {renderSection(segment.fears, 'Fears', segment.name)}
                            {renderSection(segment.pains, 'Pains', segment.name)}
                            {renderSection(segment.objections, 'Objections', segment.name)}
                            {renderSection(segment.goals, 'Goals', segment.name)}
                            {renderSection(segment.values, 'Values', segment.name)}
                            {renderSection(segment.decisionMaking, 'Decision-Making Processes', segment.name)}
                            {renderSection(segment.influences, 'Influences', segment.name)}
                            {renderSection(segment.communicationPreferences, 'Communication Preferences', segment.name)}
                        </div>
                    )}
                </div>
            ))}
        </div>


            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleCopy}
                        className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
                    >
                        {copySuccess || 'Copy All'}
                    </Button>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleDownload}
                        className="text-[#f7f8f8] border border-[#8a8f98]/40 hover:bg-[#1A1A1A]"
                    >
                        Download All
                    </Button>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={onReset}
                        className="bg-slate-800 text-[#f7f8f8] hover:bg-slate-500"
                    >
                        Reset
                    </Button>
                </div>
                <Link href="/inbound-blueprint">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="text-white flex items-center space-x-2"
                    >
                        <span>Generate Inbound Marketing Blueprint</span>
                        <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}