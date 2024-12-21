import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@/utils/token";

const CreateBlogPost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [templateIds, setTemplateIds] = useState<string>(""); // Assuming template IDs are passed as comma-separated values
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      console.log("No token found");
      router.push("/login"); // Redirect to login if no token found
    }
  }, []);

  // Handle blog post creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission (page reload)

    // Check if all fields are filled out
    if (!title || !description || !tags) {
      setError("All fields are required");
      return;
    }

    setError(null);

    const token = getAccessToken();
    try {
      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Attach token in Authorization header
        },
        body: JSON.stringify({ title, description, tags, templateIds: templateIds.split(",") }),
      });

      if (!response.ok) {
        throw new Error("Failed to create blog post");
      }

      const newPost = await response.json();
      console.log("Blog post created:", newPost);

      router.push(`/posts/${newPost.id}`);
    } catch (err) {
      setError(err.message || "Error creating blog post");
    }
  };

  // Auto resize textarea function
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    // Auto resize logic
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="bg-white text-black min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title:
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tags (comma separated):
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400 resize-none"
            style={{ minHeight: "100px" }} // Ensure the textarea starts with a minimum height
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Template IDs (comma separated):
          </label>
          <input
            id="templateIds"
            type="text"
            value={templateIds}
            onChange={(e) => setTemplateIds(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg"
        >
          Create Blog Post
        </button>
      </form>
    </div>
  );
};

export default CreateBlogPost;
