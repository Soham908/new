import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './App.css';
import { buildJobPayloadFromForm, createNexrenderJob, getJobStatus } from './kfm_render.ts';

function KFM_Frontend() {
  const [formData, setFormData] = useState({
    plan: '',
    userName: '',
    childName: '',
    amount: 100000,
    tenure: 10,
    clientAge: 30
  });
  const [jobId, setJobId] = useState(null);

  const queryClient = useQueryClient();
  const titleRef = useRef<HTMLHeadingElement>(null);


  // Job creation mutation
  const createJobMutation = useMutation({
    mutationFn: createNexrenderJob,
    onSuccess: (data: any) => {
      setJobId(data.id);
    },
    onError: (error: any) => {
      console.error('Error submitting job:', error);
      alert('Failed to submit request. Please try again.');
    }
  });

  // Job status polling query with smart interval
  const {
    data: jobData,
    isLoading: isPolling,
    error: pollingError
  } = useQuery({
    queryKey: ['job-status', jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId, // Only run when we have a jobId
    refetchInterval: (query: any) => {
      const data = query.state.data;
      // Stop polling if finished or failed
      if (data?.status === 'finished' || data?.status === 'failed') {
        return false;
      }
      // Poll every 2 seconds for active jobs
      return 2000;
    },
    refetchIntervalInBackground: false,
    retry: (failureCount: any, error: any) => {
      // Retry up to 3 times for network errors, but not for 404s
      return failureCount < 3 && error?.status !== 404;
    }
  });

  // Derived state from query data
  const isProcessing = createJobMutation.isPending ||
    (jobId && jobData?.status !== 'finished' && jobData?.status !== 'failed');

  const jobStatus = createJobMutation.isPending ? 'submitted' :
    createJobMutation.isError ? 'failed' :
      jobData?.status || (jobId ? 'queued' : 'idle');

  const progress = jobData?.progress || 0;
  const videoUrl = jobData?.outputUrl;

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === 'amount' || name === 'tenure' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.clientAge || !formData.userName) {
      alert('Please fill in all required fields');
      return;
    }

    const jobPayload = buildJobPayloadFromForm(formData);
    createJobMutation.mutate(jobPayload);
  };

  const resetForm = () => {
    if (titleRef.current) {
      titleRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center' // Centers the element in view
      });
    }

    setFormData({ plan: '', userName: '', amount: 100000, tenure: 10, childName: '', clientAge: 30 });
    setJobId(null);
    // Clear the job status query cache
    queryClient.removeQueries({ queryKey: ['job-status'] });
  };

  const manualCheckStatus = () => {
    if (jobId) {
      queryClient.invalidateQueries({ queryKey: ['job-status', jobId] });
    }
  };

  const getStatusMessage = () => {
    switch (jobStatus) {
      case 'submitted': return 'Submitting request...';
      case 'queued': return 'Video queued for processing...';
      case 'rendering': return 'Processing video...';
      case 'finished': return 'Video ready!';
      case 'failed': return 'Processing failed. Please try again.';
      default: return '';
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 ref={titleRef}>Life Goal Maximizer Personalized Video</h1>

        <div className="form-section">
          <form onSubmit={handleSubmit}>
            
            {/* <div className="form-group">
              <label htmlFor="plan">Select Investment Plan *</label>
              <select
                id="plan"
                name="plan"
                value={formData.plan}
                onChange={handleInputChange}
                required
                disabled={isProcessing || createJobMutation.isPending}
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
            </div> */}

                      <div className="input-row">
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
                                  disabled={isProcessing || createJobMutation.isPending}
                              />
                          </div>

                          <div className="form-group">
                              <label htmlFor="childName">Your Child's Name *</label>
                              <input
                                  type="text"
                                  id="childName"
                                  name="childName"
                                  value={formData.childName}
                                  onChange={handleInputChange}
                                  placeholder="Enter your child's name"
                                  required
                                  disabled={isProcessing || createJobMutation.isPending}
                              />
                          </div>
                      </div>




                      <div className="input-row">
                          <div className="form-group">
                <label htmlFor="tenure">Client Age: {formData.clientAge} years</label>
                <input
                  type="range"
                  id="clientAge"
                  name="clientAge"
                  min="20"
                  max="40"
                  step="1"
                  value={formData.clientAge}
                  onChange={handleInputChange}
                  disabled={isProcessing || createJobMutation.isPending}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>20 years</span>
                  <span>40 years</span>
                </div>
              </div>


              <div className="form-group" style={{flex: 1}}>
                <label htmlFor="tenure">Investment Tenure: {formData.tenure} years</label>
                <input
                  type="range"
                  id="tenure"
                  name="tenure"
                  min="8"
                  max="20"
                  step="1"
                  value={formData.tenure}
                  onChange={handleInputChange}
                  disabled={isProcessing || createJobMutation.isPending}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>1 year</span>
                  <span>20 years</span>
                </div>
              </div>

            </div>


            <div className="form-group">
              <label htmlFor="amount">Investment Amount: ₹{formData.amount.toLocaleString('en-IN')}</label>
              <input
                type="range"
                id="amount"
                name="amount"
                min="50000"
                max="500000"
                step="25000"
                value={formData.amount}
                onChange={handleInputChange}
                disabled={isProcessing || createJobMutation.isPending}
                className="slider"
              />
              <div className="slider-labels">
                <span>₹50,000</span>
                <span>₹5,00,000</span>
              </div>
            </div>


            <button
              type="submit"
              className="submit-btn"
              disabled={isProcessing || createJobMutation.isPending}
            >
              {createJobMutation.isPending ? 'Submitting...' :
                isProcessing ? 'Processing...' :
                  'Generate Video'}
            </button>
          </form>
        </div>

        {(isProcessing || jobStatus === 'finished' || jobStatus === 'failed') && (
          <div className="status-section">
            <h3>Video Processing Status</h3>
            <div className={`status-indicator ${jobStatus}`}>
              <div className="status-icon">
                {jobStatus === 'finished' ? '✅' :
                  jobStatus === 'failed' ? '❌' :
                    isPolling ? '🔄' : <img style={{ width: 40 }} src='HourGlassLoading.gif'/>}
              </div>
              <div className="status-text">
                {getStatusMessage()}
                {jobId && <div className="job-id">Job ID: {jobId}</div>}
              </div>
            </div>

            {isProcessing && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="progress-text">{progress}% Complete</div>
              </div>
            )}

            {isProcessing && (
              <button
                onClick={manualCheckStatus}
                className="status-btn"
                disabled={createJobMutation.isPending}
              >
                Check Status Now
              </button>
            )}
          </div>
        )}

        {videoUrl && jobStatus === 'finished' && (
          <div className="video-section">
            <h3>Your Personalized Video is Ready!</h3>
            <video
              autoPlay
              controls
              width="100%"
              style={{ maxWidth: '800px', borderRadius: '8px' }}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="video-actions">
              <button onClick={resetForm} className="reset-btn">
                Create Another Video
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(createJobMutation.error || pollingError) && (
          <div className="error-section">
            <h4>Error</h4>
            <p>{createJobMutation.error?.message || pollingError?.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default KFM_Frontend;
