import React from "react";
import CommentItem from "./CommentItem";
import "./CommentList.css";

const CommentList = ({ comments, postId, onReplied }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="empty-comments">
        <div className="empty-comments-content">
          <h3>No replies yet</h3>
          <p>Be the first to reply to this post!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comment-list">
      <div className="comment-list-header">
        <h3>Replies</h3>
        <span className="comment-count">{comments.length}</span>
      </div>

      <div className="comments">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} onReplied={onReplied} />
        ))}
      </div>
    </div>
  );
};

export default CommentList;
