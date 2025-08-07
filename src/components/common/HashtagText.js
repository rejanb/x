import React from "react";
import { useNavigate } from "react-router-dom";
import { parseTextWithHashtags } from "../../utils/hashtagUtils";
import "./HashtagText.css";

const HashtagText = ({ text, className = "" }) => {
  const navigate = useNavigate();

  const handleHashtagClick = (hashtag, e) => {
    e.stopPropagation(); // Prevent tweet navigation when clicking hashtag
    // Navigate to hashtag search or trending page
    // For now, we'll just console.log, but you can implement search later
    console.log(`Clicked hashtag: ${hashtag}`);
    // navigate(`/search?q=${encodeURIComponent('#' + hashtag)}`);
  };

  const parts = parseTextWithHashtags(text);

  return (
    <span className={`hashtag-text ${className}`}>
      {parts.map((part, index) => {
        if (part.type === "hashtag") {
          return (
            <span
              key={index}
              className="hashtag-link"
              onClick={(e) => handleHashtagClick(part.hashtag, e)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleHashtagClick(part.hashtag, e);
                }
              }}
            >
              {part.content}
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
};

export default HashtagText;
