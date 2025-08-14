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
      id: '01K2GX4X69PT5JNMP4F7ERHEWC', // your template ID
      composition: 'MainComp'
    },
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
        layerName: 'CustomerNameSlide2',
        property: 'Source Text',
        value: `Welcome ${userName}`
      },
      {
        type: 'data',
        layerName: 'CustomerNameSlide2',
        property: 'Source Text.font',
        value: 'Montserrat-SemiBold'
      },
      {
        type: 'data',
        layerName: 'GiveTerms',
        property: 'Source Text',
        value: `₹${Number(amount).toLocaleString()}`
      },
      {
        type: 'data',
        layerName: 'GetTerms',
        property: 'Source Text',
        value: `₹${Number(amount * tenure).toLocaleString()}`
      },
      {
        type: 'data',
        layerName: 'ReturnTerms',
        property: 'Source Text',
        value: `Return of Premium of ₹${Number(amount * tenure * 19).toLocaleString()} Lakhs on ${tenure} years`
      },
      {
        type: 'data',
        layerName: 'ThankYouSlide3',
        property: 'Source Text',
        value: `Thank you ${userName} for selecting this investment plan`
      }
    ]
  };
};
