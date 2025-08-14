// src/api/nexrender.js
const API_BASE = 'https://api.nexrender.com/api/v2';
const API_KEY = import.meta.env.VITE_APP_API_KEY;

// Generic fetch wrapper
const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed: ${res.status}`);
  }
  return data;
};

// Create a job (expects a valid Nexrender job payload)
export const createNexrenderJob = async (jobPayload) => {
  return request('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobPayload),
  });
};

// Get job status by ID
export const getJobStatus = async (jobId) => {
    console.log('job status fetched')
  return request(`/jobs/${jobId}`, {
    method: 'GET',
  });
};

// OPTIONAL: Build a job payload directly from your form (for quick tests)
export const buildJobPayloadFromForm = ({ plan, userName, amount, tenure }) => {
  // Map plan -> logo URL or layer assets as needed
  const logoByPlan = {
    plan1: 'https://thezeist.com/wp-content/uploads/2025/08/Logo_HDFC_Sanchay.png',
    plan2: 'https://thezeist.com/wp-content/uploads/2025/08/Logo_HDFC_Jeevan.png',
  };
  const bankLogoUrl = logoByPlan[plan] || logoByPlan.plan1;

  return {
    preview: false, // set true for faster test renders
    template: {
      id: '01K2MFCW20CFAWHF5JZ96287FX', // your template ID
      composition: 'MainComp'
    },
    fonts: [
      "Montserrat-SemiBold.ttf",
      "Montserrat-Medium.ttf",
    ],
    assets: [
      // Images (ensure correct layer names and file-type expectations)
      {
        type: 'image',
        src: bankLogoUrl,
        layerName: 'BrandLogoSlide1'
      },
      {
        type: 'image',
        src: bankLogoUrl,
        layerName: 'BrandLogoSlide3'
      },
      // Text
      {
        type: 'data',
        layerName: 'CustomerName',
        property: 'Source Text',
        value: `Welcome ${userName}`
      },
      {
        type: 'data',
        layerName: 'CustomerName',
        property: 'Source Text.font',
        value: 'Montserrat-SemiBold'
      },
      {
        type: 'data',
        layerName: 'GiveAmount',
        property: 'Source Text',
        value: `₹${Number(amount).toLocaleString()}`
      },
      {
        type: 'data',
        layerName: 'GiveStatement',
        property: 'Source Text',
        value: `Pay total ₹${Number(amount * tenure).toLocaleString()} over the premium term of ${tenure} years`
      },
      {
        type: 'data',
        layerName: 'GetAmount',
        property: 'Source Text',
        value: `₹${Number(amount * tenure).toLocaleString()}`
      },
      {
        type: 'data',
        layerName: 'ReturnPremium',
        property: 'Source Text',
        value: `Return of Premium of ₹${Number(amount * tenure * 19).toLocaleString()} Lakhs on ${tenure} years`
      },
      {
        type: 'data',
        layerName: 'ThankYouName',
        property: 'Source Text',
        value: `Thank you ${userName} for selecting this investment plan`
      }
    ]
  };
};
