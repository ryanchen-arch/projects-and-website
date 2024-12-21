import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@/utils/token";

const BlogPostPage = () => {
  const router = useRouter();
  const { postId } = router.query;

  const [blogPost, setBlogPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!postId) return; // Ensure postId is available before fetching data

    const fetchBlogPost = async () => {
      setIsLoading(true); // Start loading when fetching begins
      setError(null); // Clear previous errors
  
      try {
        const response = await fetch(`/api/postid/${postId}/getblog`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        setBlogPost(data.blog); // Set the blog data
        setRating(data.blog.rating || 0); // Set the rating if available
      } catch (err) {
        setError(err.message || "Error fetching blog post.");
      } finally {
        setIsLoading(false); // Set loading to false once the fetch is done
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`);
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Failed to fetch comments.");
        }
        const data = await response.json();
        setComments(data.comments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching comments.");
      }
    };

    // Check if the user is logged in by getting the token
    const token = getAccessToken();
    setIsLoggedIn(!!token);

    // Fetch the blog post and comments
    fetchBlogPost();
    fetchComments();
  }, [postId]);

  const handleRating = async (type: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/rating`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) throw new Error("Failed to update rating.");
      const data = await response.json();
      setRating(data.newRating);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating rating.");
    }
  };

  const handleNewComment = async () => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (!response.ok) throw new Error("Failed to post comment.");
      const data = await response.json();
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error posting comment.");
    }
  };

  if (isLoading) return <p className="text-center text-gray-500">Loading blog post...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!blogPost) return <p className="text-center text-gray-500">No blog post found.</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">{blogPost.title}</h1>
        <p className="text-gray-600 text-sm mb-2">
          <strong>Tags:</strong> {Array.isArray(blogPost.tags) ? blogPost.tags.join(", ") : blogPost.tags}
        </p>
        <p className="text-gray-800 mb-6">{blogPost.description}</p>
        <div className="flex items-center gap-4">
          <button onClick={() => handleRating("upvote")} className="px-2 py-1 bg-green-500 text-white rounded">👍</button>
          <button onClick={() => handleRating("downvote")} className="px-2 py-1 bg-red-500 text-white rounded">👎</button>
          <span className="text-lg font-bold">Rating: {rating}</span>
        </div>
        {blogPost.template && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold">Template</h3>
            <p className="text-gray-800">Name: {blogPost.template.name}</p>
            <p className="text-gray-800">Content: {blogPost.template.content}</p>
          </div>
        )}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-300 pb-4 mb-4">
                <p className="text-gray-800">{comment.content}</p>
                <small className="text-gray-500">- {comment.author?.firstName || "Anonymous"}</small>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          )}
        </div>
        {isLoggedIn && (
          <div className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Add a comment..."
            />
            <button onClick={handleNewComment} className="px-4 py-2 mt-2 bg-blue-500 text-white rounded">Post Comment</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
