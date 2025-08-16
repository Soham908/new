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
  plan: string;
  userName: string;
  amount: number;
  tenure: number;
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
  plan,
  userName,
  amount,
  tenure
}: FormPayload): NexrenderJobPayload => {
  const logoByPlan: { [key: string]: string } = {
    plan1: 'https://thezeist.com/wp-content/uploads/2025/08/Logo_HDFC_Sanchay.png',
    plan2: 'https://thezeist.com/wp-content/uploads/2025/08/Logo_HDFC_Jeevan.png',
  };
  const bankLogoUrl = logoByPlan[plan] || logoByPlan.plan1;

  return {
    preview: false,
    template: {
      id: '01K2MFCW20CFAWHF5JZ96287FX',
      composition: 'MainComp'
    },
    fonts: [
      "Montserrat-SemiBold.ttf",
      "Montserrat-Medium.ttf",
    ],
    assets: [
      { type: 'image', src: bankLogoUrl, layerName: 'BrandLogoSlide1' },
      { type: 'image', src: bankLogoUrl, layerName: 'BrandLogoSlide3' },
      { type: 'data', layerName: 'CustomerName', property: 'Source Text', value: `Welcome ${userName}` },
      { type: 'data', layerName: 'CustomerName', property: 'Source Text.font', value: 'Montserrat-SemiBold' },
      { type: 'data', layerName: 'GiveAmount', property: 'Source Text', value: `₹${Number(amount).toLocaleString()}` },
      { type: 'data', layerName: 'GiveTenure', property: 'Source Text', value: `For ${tenure} years` },
      { type: 'data', layerName: 'GiveStatement', property: 'Source Text', value: `Pay total ₹${Number(amount * tenure).toLocaleString()} over the premium term of ${tenure} years` },
      { type: 'data', layerName: 'GetAmount', property: 'Source Text', value: `₹${Number(amount * tenure).toLocaleString()}` },
      { type: 'data', layerName: 'ReturnPremium', property: 'Source Text', value: `Return of Premium of ₹${Number(amount * tenure).toLocaleString()} Lakhs on ${tenure} years` },
      { type: 'data', layerName: 'ThankYouName', property: 'Source Text', value: `${userName}` }
    ]
  };
};
