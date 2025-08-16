import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { pollsAPI } from '../services/api';
import './PollTest.css';

const PollTest = () => {
  const { user } = useAuth();
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', ''],
    expiresAt: '',
    postContent: '',
    hashtags: []
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createdPoll, setCreatedPoll] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    if (field === 'options') {
      setPollData(prev => ({
        ...prev,
        options: value
      }));
    } else if (field === 'hashtags') {
      const hashtags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setPollData(prev => ({
        ...prev,
        hashtags
      }));
    } else {
      setPollData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addOption = () => {
    if (pollData.options.length < 4) {
      setPollData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (pollData.options.length > 2) {
      setPollData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('You must be logged in to create a poll');
      return;
    }

    if (!pollData.question.trim()) {
      setError('Please enter a poll question');
      return;
    }

    const validOptions = pollData.options.filter(option => option.trim());
    if (validOptions.length < 2) {
      setError('Please provide at least 2 poll options');
      return;
    }

    if (!pollData.expiresAt) {
      setError('Please select an expiration date');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const pollPayload = {
        question: pollData.question.trim(),
        options: validOptions,
        expiresAt: new Date(pollData.expiresAt).toISOString(),
        userId: user.id,
        postContent: pollData.postContent.trim() || `Poll: ${pollData.question.trim()}`,
        hashtags: pollData.hashtags
      };

      console.log('Creating poll with data:', pollPayload);
      
      const result = await pollsAPI.createPoll(pollPayload);
      console.log('Poll created successfully:', result);
      
      setCreatedPoll(result);
      
      // Reset form
      setPollData({
        question: '',
        options: ['', ''],
        expiresAt: '',
        postContent: '',
        hashtags: []
      });
      
    } catch (err) {
      console.error('Error creating poll:', err);
      setError(err.message || 'Failed to create poll');
    } finally {
      setIsCreating(false);
    }
  };

  const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16);
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Maximum 30 days from now
    return maxDate.toISOString().slice(0, 16);
  };

  return (
    <div className="poll-test-page">
      <div className="poll-test-container">
        <h1>Poll Creation Test</h1>
        <p>Test the new poll API that automatically creates posts</p>
        
        {!user ? (
          <div className="login-required">
            <p>Please log in to test poll creation</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="poll-form">
              <div className="form-group">
                <label htmlFor="question">Poll Question *</label>
                <input
                  type="text"
                  id="question"
                  value={pollData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  placeholder="What's your favorite programming language?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="postContent">Post Content</label>
                <textarea
                  id="postContent"
                  value={pollData.postContent}
                  onChange={(e) => handleInputChange('postContent', e.target.value)}
                  placeholder="Optional: Add some context or description for your poll..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hashtags">Hashtags (comma-separated)</label>
                <input
                  type="text"
                  id="hashtags"
                  value={pollData.hashtags.join(', ')}
                  onChange={(e) => handleInputChange('hashtags', e.target.value)}
                  placeholder="coding, poll, programming"
                />
              </div>

              <div className="form-group">
                <label htmlFor="expiresAt">Expiration Date *</label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  value={pollData.expiresAt}
                  onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                />
              </div>

              <div className="form-group">
                <label>Poll Options *</label>
                {pollData.options.map((option, index) => (
                  <div key={index} className="option-input">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {pollData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="remove-option-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {pollData.options.length < 4 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="add-option-btn"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                disabled={isCreating}
                className="submit-btn"
              >
                {isCreating ? 'Creating Poll...' : 'Create Poll'}
              </button>
            </form>

            {createdPoll && (
              <div className="success-message">
                <h3>✅ Poll Created Successfully!</h3>
                <div className="poll-details">
                  <p><strong>Poll ID:</strong> {createdPoll.id}</p>
                  <p><strong>Post ID:</strong> {createdPoll.postId}</p>
                  <p><strong>Question:</strong> {createdPoll.question}</p>
                  <p><strong>Options:</strong> {createdPoll.options.join(', ')}</p>
                  <p><strong>Expires:</strong> {new Date(createdPoll.expiresAt).toLocaleString()}</p>
                  <p><strong>Created:</strong> {new Date(createdPoll.createdAt).toLocaleString()}</p>
                </div>
                <p className="note">
                  <strong>Note:</strong> A post has been automatically created and linked to this poll!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PollTest;
