'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import ReactMarkdown from 'react-markdown';
import { faArrowRight, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Playbook } from '../store/playbookStore';

interface ResultProps {
    playbooks: Playbook[] | null;
    onReset: () => void;
}

const formatPlaybooksToText = (playbooks: Playbook[]) => {
    if (!playbooks) return '';
    return playbooks.map(playbook => {
        return `
---
Title: ${playbook.title}
Target Audience: ${playbook.audience}
Pain Points: ${playbook.pain}
Fear/Risk: ${playbook.fear}
Goals: ${playbook.goals}
Common Objections: ${playbook.objection}
Value Proposition: ${playbook.value}
Decision Criteria: ${playbook.decision}
Success Metrics: ${playbook.metrics}
Communication Channels: ${playbook.communication}
Content Strategy: ${playbook.content}
Lead Generation: ${playbook.lead}
        `.trim();
    }).join('\n\n');
};

export default function Result({ playbooks, onReset }: ResultProps) {
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
    const [copySuccess, setCopySuccess] = useState('');

    const toggleSection = (playbookTitle: string, sectionTitle: string) => {
        const key = `${playbookTitle}-${sectionTitle}`;
        setOpenSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleCopy = async () => {
        if (!playbooks) return;
        try {
            const textContent = formatPlaybooksToText(playbooks);
            await navigator.clipboard.writeText(textContent);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch {
            setCopySuccess('Failed to copy');
        }
    };

    const handleDownload = () => {
        if (!playbooks) return;
        const content = formatPlaybooksToText(playbooks);
        
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'Marketing-Inbound-Blueprint.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="space-y-6">          
            <div className="space-y-4">
                {playbooks?.map((playbook, index) => (
                    <div key={index} className="bg-slate-700 rounded-xl border border-[#8a8f98]/20">
                        <div className="w-full p-4  bg-gray-800 ">
                            <span className="font-semibold text-[#f7f8f8]">{playbook.title}</span>
                        </div>
                        
                        <div className="p-4 border-t border-[#8a8f98]/20 text-[#f7f8f8]">
                            <div className="space-y-3">
                                {Object.entries({
                                    'Target Audience': playbook.audience,
                                    'Pain Points': playbook.pain,
                                    'Fears and Concerns': playbook.fear,
                                    'Goals and Aspirations': playbook.goals,
                                    'Objections': playbook.objection,
                                    'Core Values': playbook.value,
                                    'Decision-Making Process': playbook.decision,
                                    'Key Metrics': playbook.metrics,
                                    'Communication Preferences': playbook.communication,
                                    'Content Tone and Style': playbook.content,
                                    'Lead Magnet Titles': playbook.lead,
                                }).map(([title, content]) => {
                                    const sectionKey = `${playbook.title}-${title}`;
                                    return (
                                        <div key={title} className="border-b border-[#8a8f98]/20 pb-3 last:border-0 last:pb-0">
                                            <button
                                                onClick={() => toggleSection(playbook.title, title)}
                                                className="w-full flex justify-between items-center hover:bg-gray-600 rounded-lg p-2"
                                            >
                                                <h3 className="font-semibold text-left">{title}</h3>
                                                <FontAwesomeIcon 
                                                    icon={openSections[sectionKey] ? faChevronUp : faChevronDown} 
                                                    className="w-4 h-4"
                                                />
                                            </button>
                                            
                                            {openSections[sectionKey] && (
                                                <div className="px-2 pt-2">
                                                    <div className="prose prose-invert max-w-none">
                                                        <ReactMarkdown
                                                            components={{
                                                                p: ({...props}) => <p className="mb-4" {...props} />,
                                                                ul: ({...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                                                                ol: ({...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                                                                li: ({...props}) => <li className="mb-1" {...props} />,
                                                                strong: ({...props}) => <strong className="font-semibold text-green-400" {...props} />
                                                            }}
                                                        >
                                                            {content.replace(/\n/g, '  \n')}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
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
                <Link href="/calculator">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="text-white flex items-center space-x-2"
                    >
                        <span>Go To Calculator</span>
                        <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}