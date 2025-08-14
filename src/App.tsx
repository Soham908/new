// App.js
import { useState, useRef, useEffect } from 'react';
import './App.css';
import { createNexrenderJob, getJobStatus, buildJobPayloadFromForm } from './nexrender.js';

function App() {
  const [formData, setFormData] = useState({
    plan: '',
    userName: '',
    amount: 10000,
    tenure: 5
  });

  const [jobStatus, setJobStatus] = useState('idle'); // idle, submitted, queued, rendering, finished, failed
  const [jobId, setJobId] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [progress, setProgress] = useState(0);

  // useRef for interval so we can clear reliably
  const pollingRef = useRef(null);

  const plans = [
    { id: 'plan1', name: 'HDFC Sanchay Plan', logo: 'Logo_HDFC_Sanchay.png' },
    { id: 'plan2', name: 'HDFC Jeevan Plan', logo: 'Logo_HDFC_Jeevan.png' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' || name === 'tenure' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plan || !formData.userName) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      setJobStatus('submitted');

      // Build Nexrender payload directly from form
      const jobPayload = buildJobPayloadFromForm(formData);

      // Create job on Nexrender Cloud
      const job = await createNexrenderJob(jobPayload);

      setJobId(job.id);
      setJobStatus(job.status || 'queued');

      startPolling(job.id);
    } catch (error) {
      console.error('Error submitting job:', error);
      setJobStatus('failed');
      alert('Failed to submit request. Please try again.');
    }
  };

  const startPolling = (id) => {
    stopPolling(); // clear any existing interval
    pollingRef.current = setInterval(async () => {
      try {
        const statusData = await getJobStatus(id);
        // Nexrender fields can be status/state/progress/output depending on plan
        setJobStatus(statusData.status || statusData.state || 'rendering');
        setProgress(statusData.progress || 0);

        // done
        if ((statusData.state === 'finished' || statusData.status === 'finished') && (statusData.output || statusData.outputUrl)) {
          const url = statusData.output || statusData.outputUrl;
          setVideoUrl(url);
          stopPolling();
        }

        // failed
        if (statusData.state === 'error' || statusData.status === 'failed' || statusData.error) {
          stopPolling();
          setJobStatus('failed');
          alert('Video processing failed. Please try again.');
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const checkStatus = async () => {
    if (!jobId) return;
    try {
      const statusData = await getJobStatus(jobId);
      setJobStatus(statusData.status || statusData.state || 'rendering');
      setProgress(statusData.progress || 0);
      if ((statusData.state === 'finished' || statusData.status === 'finished') && (statusData.output || statusData.outputUrl)) {
        const url = statusData.output || statusData.outputUrl;
        setVideoUrl(url);
        stopPolling();
      }
    } catch (error) {
      console.error('Error checking status:', error);
      alert('Failed to check status. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ plan: '', userName: '', amount: 10000, tenure: 5 });
    setJobStatus('idle');
    setJobId(null);
    setVideoUrl('');
    setProgress(0);
    stopPolling();
  };

  const getStatusMessage = () => {
    switch (jobStatus) {
      case 'submitted': return 'Submitting request...';
      case 'queued': return 'Video queued for processing...';
      case 'rendering': return `Processing video... ${progress}%`;
      case 'finished': return 'Video ready!';
      case 'failed': return 'Processing failed. Please try again.';
      default: return '';
    }
  };

  useEffect(() => {
    return () => stopPolling(); // cleanup on unmount
  }, []);

  
  return (
    <div className="app">
      <div className="container">
        <h1>Personalized Investment Video Generator</h1>

        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="plan">Select Investment Plan *</label>
              <select
                id="plan"
                name="plan"
                value={formData.plan}
                onChange={handleInputChange}
                required
                disabled={jobStatus !== 'idle'}
              >
                <option value="">Choose a plan...</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>

              {formData.plan && (
                <div className="plan-preview">
                  <img
                    src={plans.find(p => p.id === formData.plan)?.logo}
                    alt="Plan logo"
                    className="plan-logo"
                  />
                  <p>{plans.find(p => p.id === formData.plan)?.name}</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="userName">Your Name *</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                required
                disabled={jobStatus !== 'idle'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Investment Amount: ₹{formData.amount.toLocaleString()}</label>
              <input
                type="range"
                id="amount"
                name="amount"
                min="5000"
                max="200000"
                step="5000"
                value={formData.amount}
                onChange={handleInputChange}
                disabled={jobStatus !== 'idle'}
                className="slider"
              />
              <div className="slider-labels">
                <span>₹5,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tenure">Investment Tenure: {formData.tenure} years</label>
              <input
                type="range"
                id="tenure"
                name="tenure"
                min="1"
                max="20"
                step="1"
                value={formData.tenure}
                onChange={handleInputChange}
                disabled={jobStatus !== 'idle'}
                className="slider"
              />
              <div className="slider-labels">
                <span>1 year</span>
                <span>20 years</span>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={jobStatus !== 'idle'}
            >
              {jobStatus === 'idle' ? 'Generate Video' : 'Processing...'}
            </button>
          </form>
        </div>

        {jobStatus !== 'idle' && (
          <div className="status-section">
            <h3>Video Processing Status</h3>
            <div className={`status-indicator ${jobStatus}`}>
              <div className="status-icon">
                {jobStatus === 'finished' ? '✅' :
                  jobStatus === 'failed' ? '❌' : '⏳'}
              </div>
              <div className="status-text">
                {getStatusMessage()}
                {jobId && <div className="job-id">Job ID: {jobId}</div>}
              </div>
            </div>

            {(jobStatus === 'rendering' || jobStatus === 'queued') && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            )}

            {jobStatus !== 'idle' && jobStatus !== 'finished' && (
              <button
                onClick={checkStatus}
                className="status-btn"
                disabled={jobStatus === 'submitted'}
              >
                Check Status
              </button>
            )}
          </div>
        )}

        {videoUrl && jobStatus === 'finished' && (
          <div className="video-section">
            <h3>Your Personalized Video is Ready!</h3>
            <video controls autoPlay width="100%" style={{ maxWidth: '800px', borderRadius: '8px' }}>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="video-actions">
              <a href={videoUrl} download className="download-btn">Download Video</a>
              <button onClick={resetForm} className="reset-btn">Create Another Video</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );  
}

export default App;
