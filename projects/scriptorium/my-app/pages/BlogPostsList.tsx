import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const BlogPostsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("highestRated"); // Default sorting
  const [error, setError] = useState(null);

  const LIMIT = 10;
  const router = useRouter();

  const fetchBlogPosts = async (search = "", page = 1, sort = "highestRated", limit = LIMIT) => {
    setError(null);

    try {
      const response = await fetch(
        `/api/posts/search?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}&sortBy=${sort}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setPosts(data.data); // Assuming API returns `data` with blog posts
      setTotalPages(Math.ceil(data.totalCount / limit)); // Calculate total pages
    } catch (err) {
      setError(err.message || "Error fetching blog posts");
    }
  };

  useEffect(() => {
    fetchBlogPosts(searchTerm, currentPage, sortBy);
  }, [searchTerm, currentPage, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to the first page on new search
    fetchBlogPosts(searchTerm, 1, sortBy);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePostClick = (postid) => {
    router.push(`/posts/${postid}`);
  };

  const handleCreatePost = () => {
    router.push("/posts/create-post");
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    setCurrentPage(1); // Reset to the first page on sort change
    fetchBlogPosts(searchTerm, 1, sortOption);
  };

  const parseTags = (tags) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") return tags.split(",").map((tag) => tag.trim());
    return [];
  };

  return (
    <div className="bg-white text-gray-900 max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex mb-6">
        <input
          type="text"
          placeholder="Search blog posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-l-md flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </form>

      {/* Sorting buttons */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => handleSortChange("highestRated")}
          className={`px-4 py-2 rounded-md ${
            sortBy === "highestRated"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Sort by Highest Rated
        </button>
        <button
          onClick={() => handleSortChange("lowestRated")}
          className={`px-4 py-2 rounded-md ${
            sortBy === "lowestRated"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Sort by Lowest Rated
        </button>
      </div>

      {/* Create new post button */}
      <button
        onClick={handleCreatePost}
        className="mb-6 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Create New Post
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {/* Blog posts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => handlePostClick(post.id)}
            className="p-6 border border-gray-200 rounded-lg shadow-md hover:bg-gray-50"
          >
            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            <p className="text-gray-700 mb-2">{post.description}</p>
            <p className="text-sm text-gray-500">
              Tags: {parseTags(post.tags).join(", ")}
            </p>
            <p className="text-sm text-gray-500">Rating: {post.rating}</p>
          </button>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-lg">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BlogPostsList;
