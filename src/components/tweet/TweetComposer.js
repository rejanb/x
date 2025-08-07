import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTweets } from "../../context/TweetContext";
import "./TweetComposer.css";

const TweetComposer = () => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState(1440); // 24 hours in minutes
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const { user } = useAuth();
  const { addTweet } = useTweets();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
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

      // Add poll data if poll is created
      if (
        showPollCreator &&
        pollOptions.filter((option) => option.trim()).length >= 2
      ) {
        tweetData.poll = {
          options: pollOptions
            .filter((option) => option.trim())
            .map((option) => ({
              text: option.trim(),
              votes: 0,
              voters: [],
            })),
          duration: pollDuration,
          endTime: new Date(
            Date.now() + pollDuration * 60 * 1000
          ).toISOString(),
          totalVotes: 0,
        };
      }

      addTweet(tweetData);

      setContent("");
      setSelectedImages([]);
      setShowPollCreator(false);
      setPollOptions(["", ""]);
      setPollDuration(1440);
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
