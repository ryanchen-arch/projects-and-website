import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@/utils/token";

const EditBlogPost = () => {
  const router = useRouter();
  const { postId } = router.query; // Getting the postId from the router query

  // State for blog post data and form fields
  const [blogPost, setBlogPost] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [rating, setRating] = useState<number | string>(""); // Rating as a number or empty string
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch blog post data after login
    const token = getAccessToken();
    if (!token) {
      router.push("/"); // Redirect to login page if token is not set
    }

    const fetchBlogPost = async () => {
      setError(null);

      try {
        if (postId) {
          const response = await fetch(`/api/posts/${postId}`);
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          setBlogPost(data.post);
          setTitle(data.post.title);
          setDescription(data.post.description);
          setTags(data.post.tags || "");
          setRating(data.post.rating || ""); // Set rating if available
        }
      } catch (err) {
        setError(err.message || "Error fetching blog post");
      }
    };

    if (postId) {
      fetchBlogPost();
    }
  }, [postId, router]);

  // Handle form submission (update the blog post)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const token = getAccessToken();
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, tags, rating }),
      });

      if (!response.ok) {
        throw new Error("Failed to update blog post");
      }

      const updatedPost = await response.json();
      router.push(`/posts/${updatedPost.id}`); // Redirect to the updated blog post page
    } catch (err) {
      setError(err.message || "Error updating blog post");
    }
  };

  if (!blogPost)
    return <p className="text-center text-black">No blog post found</p>;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-black">Edit Blog Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-100 text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-100 text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Tags:
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-gray-100 text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Rating:
            </label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full bg-gray-100 text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={1}
              max={5}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </form>

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default EditBlogPost;
