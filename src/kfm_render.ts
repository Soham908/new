const API_BASE = 'https://api.nexrender.com/api/v2';
const API_KEY = import.meta.env.VITE_APP_API_KEY;

// Generic fetch wrapper
const request = async (
    path: string,
    options: RequestInit = {}
): Promise<any> => {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error || data?.message || `Request failed: ${res.status}`);
    }
    return data;
};

// Define types for Job Payloads
export type FormPayload = {
    userName: string;
    amount: number;
    tenure: number;
    childName: string;
    clientAge: number;
};

export type NexrenderJobPayload = {
    preview: boolean;
    template: {
        id: string;
        composition: string;
    };
    fonts: string[];
    assets: Array<{
        type: string;
        src?: string;
        layerName: string;
        property?: string;
        value?: string;
    }>;
};

// Create a job (expects a valid Nexrender job payload)
export const createNexrenderJob = async (
    jobPayload: NexrenderJobPayload
): Promise<any> => {
    return request('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobPayload),
    });
};

// Get job status by ID
export const getJobStatus = async (jobId: string): Promise<any> => {
    console.log('job status fetched');
    return request(`/jobs/${jobId}`, {
        method: 'GET',
    });
};

// Build a job payload directly from your form (for quick tests)
export const buildJobPayloadFromForm = ({
    userName,
    amount,
    tenure,
    childName,
    clientAge
}: FormPayload): NexrenderJobPayload => {

    const testUser = {
        parentName: userName, premiumAmount: amount, termTenure: tenure, childName, parentAge: parseInt(clientAge.toString()), childAge: 5
    }

    const maturityAmounts = calculateMaturity(testUser.premiumAmount, testUser.termTenure)


    return {
        "preview": false, // Set to true for quick testing
        "template": {
            "id": "01K38JV0SPGZJ8RH6RJ44Y57GW",
            "composition": "MainComp"
        },
        "fonts": [
            "Roboto_Condensed-Bold.ttf",
            "Roboto-BoldItalic.ttf",
            "Roboto-Bold.ttf"
        ],
        "assets": [

            // Policy Details replacements
            {
                "type": "data",
                "layerName": "AnnualPremiumAmount",
                "property": "Source Text",
                "value": `₹${(testUser.premiumAmount).toLocaleString('en-IN')} p.a.`
            },
            {
                "type": "data",
                "layerName": "PremiumTerm",
                "property": "Source Text",
                "value": `${testUser.termTenure} years`
            },

            // Age Fields
            {
                "type": "data",
                "layerName": "ParentAge1",
                "property": "Source Text",
                "value": `${testUser.parentAge + 15} years`
            },
            {
                "type": "data",
                "layerName": "ParentAge2",
                "property": "Source Text",
                "value": `${testUser.parentAge + 20} years`
            },
            {
                "type": "data",
                "layerName": "ParentAge3",
                "property": "Source Text",
                "value": `${testUser.parentAge + 27} years`
            },
            {
                "type": "data",
                "layerName": "ParentAge4",
                "property": "Source Text",
                "value": `${testUser.parentAge + 35} years`
            },

            {
                "type": "data",
                "layerName": "ChildAge1",
                "property": "Source Text",
                "value": `${testUser.childAge + 15} years`
            },
            {
                "type": "data",
                "layerName": "ChildAge2",
                "property": "Source Text",
                "value": `${testUser.childAge + 20} years`
            },
            {
                "type": "data",
                "layerName": "ChildAge3",
                "property": "Source Text",
                "value": `${testUser.childAge + 27} years`
            },
            {
                "type": "data",
                "layerName": "ChildAge4",
                "property": "Source Text",
                "value": `${testUser.childAge + 35} years`
            },

            // Name Fields
            {
                "type": "data",
                "layerName": "ParentName1",
                "property": "Source Text",
                "value": `${testUser.parentName} age:`
            },
            {
                "type": "data",
                "layerName": "ParentName2",
                "property": "Source Text",
                "value": `${testUser.parentName} age:`
            },
            {
                "type": "data",
                "layerName": "ParentName3",
                "property": "Source Text",
                "value": `${testUser.parentName} age:`
            },
            {
                "type": "data",
                "layerName": "ParentName4",
                "property": "Source Text",
                "value": `${testUser.parentName} age:`
            },

            {
                "type": "data",
                "layerName": "ChildName1",
                "property": "Source Text",
                "value": `${testUser.childName} age:`
            },
            {
                "type": "data",
                "layerName": "ChildName2",
                "property": "Source Text",
                "value": `${testUser.childName} age:`
            },
            {
                "type": "data",
                "layerName": "ChildName3",
                "property": "Source Text",
                "value": `${testUser.childName} age:`
            },
            {
                "type": "data",
                "layerName": "ChildName4",
                "property": "Source Text",
                "value": `${testUser.childName} age:`
            },


            // withdrawal amounts
            {
                "type": "data",
                "layerName": "Withdraw_1",
                "property": "Source Text",
                "value": `₹${(testUser.premiumAmount * 2.5).toLocaleString('en-IN')}`
            },
            {
                "type": "data",
                "layerName": "Withdraw_2",
                "property": "Source Text",
                "value": `₹${(testUser.premiumAmount * 1).toLocaleString('en-IN')}`
            },
            {
                "type": "data",
                "layerName": "Withdraw_3",
                "property": "Source Text",
                "value": `₹${(testUser.premiumAmount * 2.5).toLocaleString('en-IN')}`
            },

            // maturity benefit amount
            {
                "type": "data",
                "layerName": "MB_8per",
                "property": "Source Text",
                "value": `₹${(maturityAmounts.maturityAt8).toLocaleString('en-IN')}`
            },
            {
                "type": "data",
                "layerName": "MB_4per",
                "property": "Source Text",
                "value": `₹${(maturityAmounts.maturityAt4).toLocaleString('en-IN')}`
            },



        ]
    };
};



function calculateMaturity(premium: number, term: number) {
    const horizon = 50; // fixed for now (video base case)
    const NET = { r8: 0.0599227506, r4: 0.0253346954 }; // calibrated effective rates
    const FACTORS: any = { 15: 2.5, 20: 1.0, 27: 2.5 }; // withdrawal multipliers

    // scale withdrawals by premium
    const withdrawals: any = {};
    for (const y in FACTORS) {
        withdrawals[y] = premium * FACTORS[y];
    }

    // future value calculation
    function maturityFV(rate: number) {
        let v = 0;
        // premiums invested
        for (let y = 1; y <= term; y++) {
            v += premium * Math.pow(1 + rate, horizon - y);
        }
        // withdrawals deducted
        for (const y in withdrawals) {
            v -= withdrawals[y] * Math.pow(1 + rate, horizon - Number(y));
        }
        return Math.round(v);
    }

    return {
        premium,
        term,
        withdrawals,
        maturityAt8: maturityFV(NET.r8),
        maturityAt4: maturityFV(NET.r4)
    };
}
