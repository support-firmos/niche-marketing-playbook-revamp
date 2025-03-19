export interface Client {
    id: string;     //Airtable base ID
    name: string;
    tableID: string;  //for Target Segments table identification (Sales Nav population)
    recordID: string; //for Customers table identification (Marketing Playbook population)
}

export const clients: Client[] = [
    { id: "appfNjSjtF4GbbLJ6", name: "CFO Medical", tableID: "tblcEbH64xisPljsY", recordID: "recadRO4MhviBbHES" },
    { id: "app3L5Dz9o7o0Ra0M", name: "NPO CFO", tableID: "tblHY4LaLGuorBm4O", recordID: "recAZdJcWES57ZTm5"   },
    { id: "appggJkcLaeUDyCHl", name: "Biotech CPA", tableID: "tbl0ZEi3s25htUvr9", recordID: "recJxflMoDfKOT535"   },
    { id: "app5phXwqXqWE2mN9", name: "FirmOS", tableID: "tblsSYRajdven0s1U", recordID: "recJmC3VWdEt9M1er"   }
];

//for marketing playbook population
export const firmOSOperationsBaseID = "app67o5y1bNykxARn";
export const firmOSCustomersTableID = "tblBzF5qD5diWWjYM";