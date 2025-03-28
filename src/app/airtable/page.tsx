'use client';
import { useEnhancedStore } from "../store/enhancedStore";
import { useSalesNavSegmentsStore } from "../store/salesNavSegmentsStore";
import { useDeepSegmentResearchStore } from "../store/deepResearchStore";
import { usePlaybookStore } from "../store/playbookStore";
import { useState } from "react"
import { clients, Client, firmOSCustomersTableID, firmOSOperationsBaseID } from "../constants/clients"
import Card from "@/components/Card";
import Sidebar from "@/components/Sidebar";
import { formatSegmentsForDisplay } from '@/app/utilities/formatSegments';
import { formatPlaybookForDisplay } from "@/app/utilities/formatPlaybook";

export default function AirtableUpload() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { step2EnhancedResearch } = useEnhancedStore();
    const { step3Segments } = useSalesNavSegmentsStore();
    const { step4DeepSegmentResearch } = useDeepSegmentResearchStore();
    const { step5GeneratedPlaybook } = usePlaybookStore();
    let formattedSalesNav, formattedPlaybook;

    if(step3Segments){
        formattedSalesNav = formatSegmentsForDisplay(step3Segments);
    }

    if(step5GeneratedPlaybook){
        formattedPlaybook = formatPlaybookForDisplay(step5GeneratedPlaybook);
    }

    const [ loading, setLoading ] = useState({
        salesNav: false,
        playbook: false
    });
    const [selectedClient, setSelectedClient ] = useState<Client|null>(null);
    const [ error, setError ] = useState<string|null>(null);

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientID = e.target.value;
        if(clientID) {
            const client = clients.find(c => c.id === clientID) || null;
            setSelectedClient(client);
        }else {
            setSelectedClient(null);
        }
    };
    
    const sendSalesNavToAirtable = async () => {
        if(!step3Segments || !selectedClient) return;
        setLoading(prev => ({...prev, salesNav: true}));

        try{   
            await fetch('api/send-sales-nav', {
                method: 'POST',
                headers: {'Content-Type': 'application/json; charset=UTF-8'},
                body: JSON.stringify({
                    data: step3Segments,
                    clientID: selectedClient.id,
                    tableID: selectedClient.tableID            
                }),
            });

        }catch(e){
            console.error('Error sending Sales Nav to Airtable:', e);
            setError('Error uploading to Airtable!')
        }finally{
            setLoading(prev => ({...prev, salesNav: false}));
        }
    }

    const sendPlaybookToAirtable = async () => {
        if(!step5GeneratedPlaybook || !selectedClient) return;
        setLoading(prev => ({...prev, playbook: true}));

        try{   
            await fetch('api/send-playbook', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    data: step5GeneratedPlaybook,
                    firmOSTableID: firmOSCustomersTableID,
                    firmOSBaseID: firmOSOperationsBaseID,
                    recordID: selectedClient.recordID    
                }),
            });

        }catch(e){
            console.error('Error sending Marketing Playbook to Airtable:', e);
        }finally{
            setLoading(prev => ({...prev, playbook: false}));
        }
    }
    
    return (
        <div>
            <div className="relative bg-black">
                <div className={`fixed top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                </div>

                <div className="max-w-3xl mx-auto relative z-10">
                <div className="bg-slate-950 backdrop-blur-sm rounded-xl p-8 shadow-xl">
                        <div className="w-full max-w-2xl"> {/* This div limits width to 50% and centers content */}
                        <h1 className="text-3xl font-bold mb-8 text-center">Upload Your Research To Airtable</h1>
  
                        {/* Client selection dropdown */}
                        <div className="mb-8">
                            <label htmlFor="client-select" className="block text-sm font-medium text-white mb-2">
                                Select Client
                            </label>
                            <div className="relative">
                                <select
                                    id="client-select"
                                    className="block w-full px-4 py-3 bg-gray-300 border border-gray-300 rounded-md shadow-sm focus:outline-none text-black  appearance-none"
                                    onChange={handleClientChange}
                                    value={selectedClient?.id || ""}
                                >
                                    <option value="">-- Select a client --</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            {!selectedClient && (
                                <p className="mt-2 text-sm text-yellow-600">
                                    Please select a client!
                                </p>
                            )}
                        </div>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-6">
                            {/* <Card 
                                title="Industry Research" 
                                data={step2EnhancedResearch}
                                clientPicked={!selectedClient ? false : true}
                            />     */}
                            <Card 
                                title="Target Segments (Sales Nav Params)" 
                                data={formattedSalesNav} 
                                onSendToApi={sendSalesNavToAirtable}
                                isLoading={loading.salesNav}
                                clientPicked={!selectedClient ? false : true}
                            />        
                            {/* <Card 
                                title="Deep Industry Research" 
                                data={step4DeepSegmentResearch?.displayContent} 
                                clientPicked={!selectedClient ? false : true}
                    
                            /> */}
                            <Card 
                                title="Customers (Inbound Marketing Blueprint)" 
                                data={formattedPlaybook} 
                                onSendToApi={sendPlaybookToAirtable}
                                clientPicked={!selectedClient ? false : true}
                            />
                            </div>
                        </div>
                </div>
            </div>
            </div>
        </div>
    );
}