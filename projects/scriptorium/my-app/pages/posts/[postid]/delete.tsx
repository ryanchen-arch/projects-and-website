import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@/utils/token";

const DeleteBlogPostPage = () => {
  const router = useRouter();
  const { postId } = router.query; // Getting the postId from the router query

  const [blogPost, setBlogPost] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog post data based on postId
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      console.log("No token found, not logged in");
      router.push("/");
    }

    const fetchData = async () => {
      setError(null);

      try {
        if (postId) {
          const response = await fetch(`/api/posts/${postId}`);
          if (!response.ok) throw new Error("Error fetching blog post");

          const data = await response.json();
          setBlogPost(data.post); // Assuming data has a 'post' property
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [postId, router]);

  // Handle blog post deletion
  const handleDelete = async () => {
    const token = getAccessToken();
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete blog post");

      router.push("/blogPostsList"); // Redirect to the list of blog posts after deletion
    } catch (err) {
      setError(err.message || "Error deleting blog post");
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    router.push(`/posts/${postId}`); // Go back to the individual blog post page
  };

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!blogPost)
    return <p className="text-center text-black">No blog post found</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-black mb-4">Delete Blog Post</h1>
        <p className="text-black mb-6">
          Are you sure you want to delete the following blog post? This action
          cannot be undone.
        </p>

        <div className="p-4">
          <h2 className="text-lg font-semibold text-black">{blogPost.title}</h2>
          <p className="text-black mt-2">{blogPost.description}</p>
          <div className="mt-4 text-black">
            <strong>Tags:</strong>{" "}
            <span className="text-sm text-black">{blogPost.tags}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 disabled:opacity-50"
          >
            Yes, Delete
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-400 disabled:opacity-50"
          >
            No, Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBlogPostPage;
