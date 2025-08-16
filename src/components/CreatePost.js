import React, { useRef, useState } from 'react';
import { postsAPI } from '../services/api';
import ApiService, { pollAPI } from '../services/apiService';
import { useRealTime } from '../context/RealTimeContext';
import { useAuth } from '../context/AuthContext';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const { showTestNotification } = useRealTime();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [isPoll, setIsPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [postPollToFeed, setPostPollToFeed] = useState(false); // optional: also create a Post for the poll
  const [isLoading, setIsLoading] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const MAX_CHARACTERS = 280;
  const remainingChars = MAX_CHARACTERS - content.length;
  const isOverLimit = remainingChars < 0;
  // Allow posting when there's either text, at least one image/video, or a poll
  const hasPollReady = isPoll && showPollForm && pollOptions.filter(o => o.trim() !== '').length >= 2 && (pollQuestion.trim().length > 0 || content.trim().length > 0);
  const canPost = ((content.trim().length > 0) || files.length > 0 || hasPollReady) && !isOverLimit && !isLoading;

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

    // Check if user is authenticated and has an ID
    if (!user || !user.id) {
      alert('You must be logged in to create a post');
      return;
    }

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
        // Create poll via Polls API first
        const pollPayload = {
          question: pollQuestion,
          options: pollOptions.filter(opt => opt.trim() !== ''),
          // expiresAt can be added later via UI; skip to let it be active
          userId: user?.id
        };

        console.log('🔍 Creating poll via Polls API:', pollPayload);
        const createdPoll = await ApiService.poll.createPoll(pollPayload);
        const pollId = createdPoll?.id;
        if (!pollId) throw new Error('Poll creation failed: missing id');

        if (postPollToFeed) {
          // Optionally create a post that links to this poll by id
          const postData = {
            content: cleanContent || pollQuestion,
            authorId: user?.id,
            hashtags: hashtags.map(tag => tag.slice(1)),
            mentions: mentions.map(mention => mention.slice(1)),
            poll: { id: pollId } // Link existing poll
          };

          result = await postsAPI.createPost(postData);
          console.log('✅ Post linked to poll created:', result);
        } else {
          // No post created; inform user to view in Polls tab
          result = null;
          console.log('✅ Poll created without posting to feed. Poll ID:', pollId);
        }
      } else {
        // Create normal post or post with media
  if (files.length > 0) {
          // Post with media
          const postData = {
            content: cleanContent,
            authorId: user?.id, // Use actual user ID
            hashtags: hashtags.map(tag => tag.slice(1)),
            mentions: mentions.map(mention => mention.slice(1))
          };

          console.log('🔍 Creating post with media:', postData, 'Files:', files);
          result = await postsAPI.createPostWithMedia(postData, files);
          console.log('✅ Post with media created:', result);
    } else {
          // Text-only post
          const postData = {
      content: cleanContent, // allow empty string when media exists (backend accepts string)
            authorId: user?.id, // Use actual user ID
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

      // Notify parent component only if a Post was created (not for poll-only)
      if (onPostCreated && result) {
        onPostCreated(result);
      }

      // Show notification for successful creation
      if (showTestNotification) {
        if (result) {
          const postContent = result.content || content || pollQuestion;
          showTestNotification('post', `You posted: "${postContent.substring(0, 50)}${postContent.length > 50 ? '...' : ''}"`);
        } else if (isPoll) {
          showTestNotification('post', 'Poll created! Check the Polls tab.');
        }
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

              {/* Option to also create a Post for the poll */}
              <label className="poll-post-toggle" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={postPollToFeed}
                  onChange={(e) => setPostPollToFeed(e.target.checked)}
                />
                <span>Also post this poll to the feed</span>
              </label>
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
        // Prefer images; videos still allowed for flexibility
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default CreatePost;
