import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTweets } from '../context/TweetContext';
import { pollsAPI, postsAPI } from '../services/api';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { loadTweets } = useTweets();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [isPoll, setIsPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(1440); // 24 hours in minutes
  const [isLoading, setIsLoading] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const MAX_CHARACTERS = 280;
  const remainingChars = MAX_CHARACTERS - content.length;
  const isOverLimit = remainingChars < 0;
  const canPost = content.trim().length > 0 && !isOverLimit && !isLoading;

  // Extract hashtags and mentions from content
  const extractHashtags = (text) => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return text.match(hashtagRegex) || [];
  };

  const extractMentions = (text) => {
    const mentionRegex = /@[\w\u0590-\u05ff]+/g;
    return text.match(mentionRegex) || [];
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CHARACTERS) {
      setContent(newContent);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== selectedFiles.length) {
      alert('Some files were invalid. Only images/videos under 10MB are allowed.');
    }
    
    setFiles(prev => [...prev, ...validFiles].slice(0, 4)); // Max 4 files
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const togglePoll = () => {
    if (isPoll) {
      setShowPollForm(false);
      setIsPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollDuration(1440);
    } else {
      setIsPoll(true);
      setShowPollForm(true);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canPost) return;

    // Check if user is authenticated and has an ID
    if (!user || !user.id) {
      alert('You must be logged in to create a post');
      return;
    }

    // Validate poll data if creating a poll
    if (isPoll && showPollForm) {
      if (!pollQuestion.trim()) {
        alert('Please enter a poll question');
        return;
      }
      
      const validOptions = pollOptions.filter(option => option.trim());
      if (validOptions.length < 2) {
        alert('Please provide at least 2 poll options');
        return;
      }
    }

    setIsLoading(true);

    try {
      // If creating a poll, use the polls API (which automatically creates a post)
      if (isPoll && showPollForm && pollQuestion.trim() && pollOptions.filter(option => option.trim()).length >= 2) {
        const pollData = {
          question: pollQuestion.trim(),
          options: pollOptions.filter(option => option.trim()),
          expiresAt: new Date(Date.now() + pollDuration * 60 * 1000).toISOString(),
          userId: user.id,
          postContent: content.trim(),
          hashtags: extractHashtags(content).map(tag => tag.slice(1)) // Remove # from hashtags
        };

        try {
          const createdPoll = await pollsAPI.createPoll(pollData);
          console.log('✅ Poll created successfully:', createdPoll);
          
          // Reset form
          setContent('');
          setFiles([]);
          setPollQuestion('');
          setPollOptions(['', '']);
          setPollDuration(1440);
          setIsPoll(false);
          setShowPollForm(false);
          
          // Refresh tweets to show the new post
          await loadTweets(1, false);
          
          // Notify parent component
          if (onPostCreated) {
            onPostCreated();
          }
          
          alert('Poll created successfully! The post with your poll has been created.');
        } catch (pollError) {
          console.error('❌ Error creating poll:', pollError);
          alert('Failed to create poll. Please try again.');
        }
      } else {
        // Create regular post (without poll)
        const cleanContent = content.trim();
        const hashtags = extractHashtags(cleanContent);
        const mentions = extractMentions(cleanContent);
        
        console.log('🔍 Creating regular post:', { content: cleanContent, hashtags, mentions });
        
        const postData = {
          content: cleanContent,
          authorId: user.id,
          hashtags: hashtags.map(tag => tag.slice(1)), // Remove # from hashtags
          mentions: mentions.map(mention => mention.slice(1)), // Remove @ from mentions
        };

        let result;
        if (files.length > 0) {
          result = await postsAPI.createPostWithMedia(postData, files);
        } else {
          result = await postsAPI.createPost(postData);
        }

        console.log('✅ Post created:', result);
        
        // Reset form
        setContent('');
        setFiles([]);
        
        // Refresh tweets to show the new post
        await loadTweets(1, false);
        
        // Notify parent component
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="create-post">
      <div className="post-header">
        <div className="user-avatar">
          <span>{user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
        <div className="post-input-container">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="What's happening?"
            maxLength={MAX_CHARACTERS}
            disabled={isLoading}
          />
          
          {/* File previews */}
          {files.length > 0 && (
            <div className="file-previews">
              {files.map((file, index) => (
                <div key={index} className="file-preview">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" />
                  ) : (
                    <video src={URL.createObjectURL(file)} controls />
                  )}
                  <button
                    type="button"
                    className="remove-file"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Poll form */}
          {showPollForm && (
            <div className="poll-form">
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                maxLength={100}
              />
              <div className="poll-options">
                {pollOptions.map((option, index) => (
                  <div key={index} className="poll-option">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      maxLength={25}
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        className="remove-option"
                        onClick={() => removePollOption(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    className="add-option"
                    onClick={addPollOption}
                  >
                    + Add option
                  </button>
                )}
              </div>
              
              <div className="poll-duration">
                <label htmlFor="poll-duration">Poll duration:</label>
                <select
                  id="poll-duration"
                  value={pollDuration}
                  onChange={(e) => setPollDuration(parseInt(e.target.value))}
                >
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={240}>4 hours</option>
                  <option value={480}>8 hours</option>
                  <option value={1440}>1 day</option>
                  <option value={4320}>3 days</option>
                  <option value={10080}>7 days</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="post-actions">
        <div className="action-buttons">
          <button
            type="button"
            className="action-btn media-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Add media"
          >
            📷
          </button>
          
          <button
            type="button"
            className={`action-btn poll-btn ${isPoll ? 'active' : ''}`}
            onClick={togglePoll}
            disabled={isLoading}
            title="Create poll"
          >
            📊
          </button>
        </div>

        <div className="post-controls">
          <div className="character-count">
            <span className={isOverLimit ? 'over-limit' : ''}>
              {remainingChars}
            </span>
          </div>
          
          <button
            type="submit"
            className="post-button"
            disabled={!canPost}
            onClick={handleSubmit}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default CreatePost;
