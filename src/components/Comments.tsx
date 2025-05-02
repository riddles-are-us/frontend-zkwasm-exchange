import React, { useCallback, useState } from "react";
import { CommentsUI, CommentItem } from "polymarket-ui";

const generateMockComments = (): CommentItem[] => {
  return [
    {
      id: "1",
      author: {
        name: "John Doe",
        position: "Market Analyst",
        avatar: "https://i.pravatar.cc/150?u=john",
      },
      content: "This market is showing strong potential for growth in the coming weeks.",
      timestamp: "2 hours ago",
      likes: 24,
      userHasLiked: false,
    },
    {
      id: "2",
      author: {
        name: "Jane Smith",
        position: "Trader",
        avatar: "https://i.pravatar.cc/150?u=jane",
      },
      content: "The recent price movement suggests a bullish trend.",
      timestamp: "5 hours ago",
      likes: 15,
      userHasLiked: true,
    },
  ];
};

export const Comments = () => {
  const [comments] = useState<CommentItem[]>(generateMockComments());
  const [selectedSort, setSelectedSort] = useState("newest");

  const handleAddComment = useCallback((content: string) => {
    console.log("New comment:", content);
    // Implement comment addition logic
  }, []);

  const handleLikeComment = useCallback((commentId: string) => {
    console.log("Like comment:", commentId);
    // Implement like functionality
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSelectedSort(value);
    console.log("Sort changed to:", value);
    // Implement sort logic
  }, []);

  const handleReply = useCallback((commentId: string, content: string) => {
    console.log("Reply to comment:", commentId, "with content:", content);
    // Implement reply functionality
  }, []);

  const commentsProps = {
    comments,
    totalComments: comments.length,
    selectedSort,
    onAddComment: handleAddComment,
    onLikeComment: handleLikeComment,
    onSortChange: handleSortChange,
    onReply: handleReply,
  }
  return (
    <CommentsUI {...commentsProps} />
  );
}