import React, { useRef, useState } from 'react';
import { postsAPI } from '../services/api';
import { useRealTime } from '../context/RealTimeContext';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const { showTestNotification } = useRealTime();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [isPoll, setIsPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
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

    setIsLoading(true);

    try {
      let result;
      const hashtags = extractHashtags(content);
      const mentions = extractMentions(content);
      
      // Clean content (remove hashtags and mentions for cleaner text)
      const cleanContent = content
        .replace(/#[\w\u0590-\u05ff]+/g, '')
        .replace(/@[\w\u0590-\u05ff]+/g, '')
        .trim();

      if (isPoll && showPollForm) {
        // Create poll post
        const pollData = {
          question: pollQuestion,
          options: pollOptions.filter(opt => opt.trim() !== ''),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'test-user-123' // Hardcoded for now
        };

        console.log('🔍 Creating poll post:', { content: cleanContent, pollData });
        
        // For now, create post with poll data embedded
        const postData = {
          content: cleanContent || pollQuestion,
          authorId: 'test-user-123',
          hashtags: hashtags.map(tag => tag.slice(1)), // Remove # symbol
          mentions: mentions.map(mention => mention.slice(1)), // Remove @ symbol
          poll: pollData
        };

        result = await postsAPI.createPost(postData);
        console.log('✅ Poll post created:', result);
      } else {
        // Create normal post or post with media
        if (files.length > 0) {
          // Post with media
          const postData = {
            content: cleanContent,
            authorId: 'test-user-123',
            hashtags: hashtags.map(tag => tag.slice(1)),
            mentions: mentions.map(mention => mention.slice(1))
          };

          console.log('🔍 Creating post with media:', postData, 'Files:', files);
          result = await postsAPI.createPostWithMedia(postData, files);
          console.log('✅ Post with media created:', result);
        } else {
          // Text-only post
          const postData = {
            content: cleanContent,
            authorId: 'test-user-123',
            hashtags: hashtags.map(tag => tag.slice(1)),
            mentions: mentions.map(mention => mention.slice(1))
          };

          console.log('🔍 Creating text post:', postData);
          result = await postsAPI.createPost(postData);
          console.log('✅ Text post created:', result);
        }
      }

      // Reset form
      setContent('');
      setFiles([]);
      setIsPoll(false);
      setShowPollForm(false);
      setPollQuestion('');
      setPollOptions(['', '']);

      // Notify parent component
      if (onPostCreated && result) {
        onPostCreated(result);
      }

      // Show notification for successful post creation
      if (showTestNotification && result) {
        const postContent = result.content || content;
        showTestNotification('post', `You posted: "${postContent.substring(0, 50)}${postContent.length > 50 ? '...' : ''}"`);
      }

      // Show success message
      console.log('✅ Post created successfully!');
      // Removed alert to avoid interrupting the flow

    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert('Failed to create post: ' + (error.message || 'Unknown error'));
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
          <span>T</span>
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
