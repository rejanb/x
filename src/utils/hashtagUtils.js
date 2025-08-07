// Utility functions for handling hashtags in tweets

// Extract hashtags from text
export const extractHashtags = (text) => {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  return text.match(hashtagRegex) || [];
};

// Check if text contains hashtags
export const hasHashtags = (text) => {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  return hashtagRegex.test(text);
};

// Parse text and return array of text parts and hashtags
export const parseTextWithHashtags = (text) => {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    // Add text before hashtag
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add hashtag
    parts.push({
      type: "hashtag",
      content: match[0],
      hashtag: match[0].slice(1), // Remove # symbol
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return parts;
};

// Convert hashtag to URL-friendly format
export const hashtagToSlug = (hashtag) => {
  return hashtag.toLowerCase().replace(/[^a-z0-9_]/g, "");
};

// Format hashtag for display
export const formatHashtag = (hashtag) => {
  return `#${hashtag}`;
};
