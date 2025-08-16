import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTweets } from "../../context/TweetContext";
import { pollsAPI } from "../../services/api";
import "./TweetComposer.css";

const TweetComposer = () => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState(1440); // 24 hours in minutes
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const { user } = useAuth();
  const { addTweet } = useTweets();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) return;

    // If creating a poll, validate poll data
    if (showPollCreator) {
      if (!pollQuestion.trim()) {
        alert("Please enter a poll question");
        return;
      }
      
      const validOptions = pollOptions.filter((option) => option.trim());
      if (validOptions.length < 2) {
        alert("Please provide at least 2 poll options");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // If creating a poll, create it via the polls API (which automatically creates a post)
      if (showPollCreator && pollQuestion.trim() && pollOptions.filter((option) => option.trim()).length >= 2) {
        const pollData = {
          question: pollQuestion.trim(),
          options: pollOptions.filter((option) => option.trim()),
          expiresAt: new Date(Date.now() + pollDuration * 60 * 1000).toISOString(),
          userId: user.id,
          postContent: content.trim(),
          hashtags: extractHashtags(content)
        };

        try {
          const createdPoll = await pollsAPI.createPoll(pollData);
          console.log("Poll created successfully:", createdPoll);
          
          // Reset poll form
          setPollQuestion("");
          setPollOptions(["", ""]);
          setPollDuration(1440);
          setShowPollCreator(false);
          setContent("");
          setSelectedImages([]);
          
          // Refresh the feed to show the new poll post
          // You might want to add a callback here to refresh the parent component
          alert("Poll created successfully! The post with your poll has been created.");
        } catch (pollError) {
          console.error("Error creating poll:", pollError);
          alert("Failed to create poll. Please try again.");
        }
      } else {
        // Create a regular tweet/post (without poll)
        const tweetData = {
          content: content.trim(),
          author: {
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            profilePicture: user.profilePicture,
          },
          images: selectedImages,
        };

        addTweet(tweetData);

        setContent("");
        setSelectedImages([]);
      }
    } catch (error) {
      console.error("Error posting tweet:", error);
    }

    setIsSubmitting(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImages((prev) => [...prev, event.target.result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const togglePollCreator = () => {
    setShowPollCreator(!showPollCreator);
    if (!showPollCreator) {
      // Reset poll when hiding
      setPollQuestion("");
      setPollOptions(["", ""]);
      setPollDuration(1440);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Show hashtag suggestions if user types #
    const lastChar = newContent.slice(-1);
    const wordsArray = newContent.split(" ");
    const lastWord = wordsArray[wordsArray.length - 1];

    if (lastWord.startsWith("#") && lastWord.length > 1) {
      setShowHashtagSuggestions(true);
    } else {
      setShowHashtagSuggestions(false);
    }
  };

  const popularHashtags = [
    "#react",
    "#javascript",
    "#coding",
    "#webdev",
    "#frontend",
    "#programming",
    "#tech",
    "#startup",
  ];

  const getHashtagSuggestions = () => {
    const wordsArray = content.split(" ");
    const lastWord = wordsArray[wordsArray.length - 1];

    if (lastWord.startsWith("#") && lastWord.length > 1) {
      const searchTerm = lastWord.toLowerCase();
      return popularHashtags
        .filter((tag) => tag.toLowerCase().includes(searchTerm.slice(1)))
        .slice(0, 5);
    }
    return [];
  };

  const selectHashtag = (hashtag) => {
    const wordsArray = content.split(" ");
    wordsArray[wordsArray.length - 1] = hashtag;
    setContent(wordsArray.join(" ") + " ");
    setShowHashtagSuggestions(false);
  };

  // Helper function to extract hashtags from content
  const extractHashtags = (text) => {
    const hashtagRegex = /#[\w]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  };

  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  return (
    <div className="tweet-composer">
      <div className="composer-header">
        <div className="user-avatar">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.username} />
          ) : (
            <div className="avatar-placeholder">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="composer-form">
          <div className="textarea-container">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="What's happening?"
              className="composer-textarea"
              maxLength={maxLength}
              rows={3}
            />

            {/* Hashtag Suggestions */}
            {showHashtagSuggestions && getHashtagSuggestions().length > 0 && (
              <div className="hashtag-suggestions">
                {getHashtagSuggestions().map((hashtag, index) => (
                  <button
                    key={index}
                    type="button"
                    className="hashtag-suggestion"
                    onClick={() => selectHashtag(hashtag)}
                  >
                    {hashtag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Image Preview */}
          {selectedImages.length > 0 && (
            <div className="image-preview-container">
              {selectedImages.map((image, index) => (
                <div key={index} className="image-preview">
                  <img src={image} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage(index)}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Poll Creator */}
          {showPollCreator && (
            <div className="poll-creator">
              <div className="poll-header">
                <h4>Create a Poll</h4>
                <button
                  type="button"
                  className="close-poll"
                  onClick={togglePollCreator}
                  title="Close poll"
                >
                  ✕
                </button>
              </div>

              <div className="poll-question-input">
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  maxLength={100}
                  className="poll-question-field"
                />
              </div>

              <div className="poll-options">
                {pollOptions.map((option, index) => (
                  <div key={index} className="poll-option-input">
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
                        title="Remove option"
                      >
                        ✕
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

          <div className="composer-footer">
            <div className="composer-actions">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: "none" }}
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="action-button"
                title="Add photo"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#1d9bf0">
                  <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                </svg>
              </label>
              <button
                type="button"
                className={`action-button ${showPollCreator ? "active" : ""}`}
                onClick={togglePollCreator}
                title="Add poll"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#1d9bf0">
                  <path d="M6 5c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM6 11c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM6 17c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM12 5c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM12 11c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM12 17c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM18 5c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM18 11c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM18 17c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2z" />
                </svg>
              </button>
            </div>

            <div className="composer-submit">
              <div
                className={`char-count ${remainingChars < 20 ? "warning" : ""}`}
              >
                {remainingChars}
              </div>

              <button
                type="submit"
                disabled={!content.trim() || isSubmitting || remainingChars < 0}
                className="tweet-button"
              >
                {isSubmitting ? "Posting..." : "Tweet"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TweetComposer;
