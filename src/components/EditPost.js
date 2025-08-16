import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTweets } from '../context/TweetContext';
import './EditPost.css';

const EditPost = ({ post, onClose, onSave }) => {
  const { user } = useAuth();
  const { editTweet } = useTweets();
  const [content, setContent] = useState(post?.content || '');
  const [hashtags, setHashtags] = useState(post?.hashtags || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setHashtags(post.hashtags || []);
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Clean up hashtags - remove empty ones and ensure proper format
      const cleanHashtags = hashtags
        .filter(tag => tag.trim())
        .map(tag => tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`);

      const updatedData = {
        content: content.trim(),
        hashtags: cleanHashtags,
      };

      await editTweet(post._id || post.id, updatedData);
      
      if (onSave) {
        onSave(updatedData);
      }
      
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to update post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHashtagChange = (index, value) => {
    const newHashtags = [...hashtags];
    newHashtags[index] = value;
    setHashtags(newHashtags);
  };

  const addHashtag = () => {
    setHashtags([...hashtags, '']);
  };

  const removeHashtag = (index) => {
    const newHashtags = hashtags.filter((_, i) => i !== index);
    setHashtags(newHashtags);
  };

  if (!post) return null;

  return (
    <div className="edit-post-overlay">
      <div className="edit-post-modal">
        <div className="edit-post-header">
          <h3>Edit Post</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-post-form">
          <div className="form-group">
            <label htmlFor="content">Post Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              rows={4}
              maxLength={280}
              disabled={isLoading}
              required
            />
            <div className="character-count">
              {content.length}/280
            </div>
          </div>

          <div className="form-group">
            <label>Hashtags</label>
            <div className="hashtags-container">
              {hashtags.map((tag, index) => (
                <div key={index} className="hashtag-input-group">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleHashtagChange(index, e.target.value)}
                    placeholder="#hashtag"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => removeHashtag(index)}
                    className="remove-hashtag"
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addHashtag}
                className="add-hashtag"
                disabled={isLoading}
              >
                + Add Hashtag
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={isLoading || !content.trim()}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
