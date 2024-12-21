import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import { useState, useEffect } from "react";
import { it } from "node:test";
import { count } from "node:console";
import { useRouter } from 'next/router';

import { jwtDecode } from 'jwt-decode';

interface SearchItem {
  id: number;
  title: string;
  description: string;
  explanation: string;
  tags: string;
  code: string;

}

interface Author {
  id: number;
  firstName: string;
  lastName: string;
}


interface Template {
  id: number;
  title: string;
  explanation: string;
  tags: string;
  code: string;
}

interface Post {
  id: number;
  title: string;
  description: string;
  tags: string;
  author: Author; 
  Template: Template; 
  rating: number;
}

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("posts");
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [topTemplates, setTopTemplates] = useState<Template[]>([]);
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchClicked, setSearchClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  useEffect(() => {
    const fetchTopPostsTemplates = async () => {
      const res = await fetch("/api/posts/post?topRated=true");
      const templatesRes = await fetch('/api/templates/search');
      const templatesData = await templatesRes.json();
      const data = await res.json();
      setTopPosts(data.posts);
      setTopTemplates(templatesData.data);
      const templateScore: { [key: number]: { template: Template; count: number } } = {}
      data.posts.forEach((post: Post) => {
        // calculate template score by (post.rating + 1) * # of times appearing in posts
        if (!post.Template === null) {
          const curTemplate = post.Template.id;
          if (templateScore[curTemplate]) {
            templateScore[curTemplate].count += (post.rating + 1)
          }
          else {
            templateScore[curTemplate] = {
              template: post.Template,
              count: (post.rating + 1)
            }
          }
        }
      });
      
      templatesData.data.forEach((temp: Template) => {
        if (!templateScore[temp.id]) {
          templateScore[temp.id] = {
            template: temp,
            count: 0
          }
        }
      })
      // Merge the used templates with unused ones
      const allTemplates = [...topTemplates].map((template) => {
        const usage = templateScore[template.id];
        return {
          template,
          count: usage ? usage.count : 0,
        };
      });
      const sortedTemplates = Object.values(templateScore).sort(
        (a, b) => b.count - a.count // Sort templates by usage count
      );

      setTopTemplates(sortedTemplates.slice(0, 5).map(item => item.template));

    };

    fetchTopPostsTemplates();
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

      // Check if the token is expired
      if (decoded.exp < currentTime) {
        // Token has expired
        localStorage.removeItem('token'); 
        setIsLoggedIn(false); // Update the state
      } else {
        setIsLoggedIn(true); 
      }
    }
  }, []);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleSearch = async (page = 1) => {
    if (!query) return;
    
    setSearchClicked(true);
    // Define the endpoints for both posts and templates
    const postEndpoint = "/api/posts/post";
    const templateEndpoint = "/api/templates/search";
  
    // Prepare promises to fetch both posts and templates
    // const postPromise = fetch(`${postEndpoint}?page=1&limit=10&title=${query}&content=${query}`).then((res) => res.json());
    // const templatePromise = fetch(`${templateEndpoint}?search=${query}&page=1&limit=10`).then((res) => res.json());
  
    // Wait for both fetch requests to complete
    // const [postData, templateData] = await Promise.all([postPromise, templatePromise]);
  
    // Handle search results for posts
    if (searchType === "posts") {
      const response = await fetch(
        `/api/posts/search?search=${query}&page=${page}&limit=10`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setSearchItems(data.data);
      setTotalPages(Math.ceil(data.totalCount / 10)); 
      // setTopPosts(postData.posts); // Update with search results for posts
    } 
  
    // Handle search results for templates
    if (searchType === "templates") {

      const response = await fetch(
        `/api/templates/search?search=${query}&page=${page}&limit=10`
      );
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      setSearchItems(data.data);
      setTotalPages(Math.ceil(data.totalCount / 10)); 
      // setTopTemplates(templateData.data); // Update with search results for templates
    } 
  };
  useEffect(() => {
    handleSearch(currentPage);
  }, [currentPage]);
  
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      
      if (res.ok) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        window.location.reload();
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
    }
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handleLogin = () => {
    router.push('/login');
    setIsLoggedIn(true);
  };
  const handleEdit = () => {
    router.push('/editor');
  };
  const handleIndex = () => {
    router.push('/#');
  }
  const handleTemplate = () => {
    router.push('/templateList');
  }
  const handleViewProfile = () => {
    router.push('/viewProfile');  
  }
  const handleEditProfile = () => {
    router.push('/editProfile');   
  }
  const handleMyPosts = () => {
    router.push('/myPosts');   
  }
  const handleMyTemplates = () => {
    router.push('/myTemplates');   
  }
  const handlePosts = () => {
    router.push('/BlogPostsList');
  }

  return (
    <>
      <nav className="bg-gray-800 text-white py-7">
        {/* Navigation Bar */}
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <div className="flex items-center space-x-8">
            {/* 
            <a href="#" onClick={handleIndex} className="text-lg font-semibold hover:text-gray-400">
              Home
            </a>
            <a href="#" onClick={handleTemplate} className="text-lg font-semibold hover:text-gray-400">
              Templates
            </a>
            */}
            
            <a href="#" onClick={handlePosts} className="text-lg font-semibold hover:text-gray-400">
              
            </a>
          </div>
        </div>

        {/* Hamburger Menu */}
        <button
          id="hamburger-menu"
          className="flex flex-col items-center space-y-1 justify-between h-5 absolute top-20 right-4"
          onClick={toggleDropdown}
        >
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>

        {/* Dropdown Menu */}
        <div
          id="nav-links-sm"
          className={`${isOpen ? "block" : "hidden"} bg-blue-500 text-white p-4 space-y-2 absolute top-30 right-4 w-48 rounded-lg shadow-lg`}
        >
          <a href="#" onClick={handleViewProfile} className="block py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200">View Profile</a>
          <a href="#" onClick={handleEditProfile} className="block py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200">Edit Profile</a>
          <a href="#" onClick={handleMyPosts} className="block py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200">Created Posts</a>
          <a href="#" onClick={handleMyTemplates} className="block py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200">Created Templates</a>
          {/*
          {isLoggedIn ? (
              <a href="#" onClick={handleLogout} className="block py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200">
                Logout
              </a>
            ) : (
              <a href="#" onClick={handleLogin} className="block py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200">
                Login
              </a>
            )}
          */}
          
          </div>
      </nav>
      <div className="min-h-screen bg-gray-100 font-sans">
        {/* Search Bar */}
        <div className="flex justify-center py-8">
          <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg max-w-2xl w-full">
            <input
              type="text"
              placeholder={`Search ${searchType === "posts" ? "blog posts" : "templates"}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-gray-100 text-gray-800 w-full p-4 border-r-2 border-gray-300 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-6 py-4 hover:bg-blue-600 transition-all duration-300"
            >
              Search
            </button>
          </div>
        </div>
        <div className="flex justify-center py-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 focus:outline-none focus:border-blue-500 hover:bg-gray-300 transition-all duration-300"
          >
            <option value="posts">Search Blog Posts</option>
            <option value="templates">Search Templates</option>
          </select>
        </div>

        {/* Search Results*/ }
        <div className="px-4 py-8 max-w-6xl mx-auto">
          <div className="space-y-6">
          {searchClicked && searchItems.length === 0 ? (
            <p className="text-xl font-semibold text-gray-900">No Results</p>
          ) : (
            searchItems.map((item) => (
              <div key={item.id} className="search-item">
                <h4 className="text-xl font-semibold text-gray-900">{item.title}</h4>
                <p className="text-gray-700">{item.description ? item.description: item.explanation}</p>
                <p className="text-gray-700">{item.tags}</p>
                <p className="text-gray-700">{item.code}</p>
              </div>
            ))
          )}
          </div>
        </div>

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

        {/* Top Blog Posts */}
        <div className="px-4 py-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Top Blog Posts</h2>
          <div className="space-y-6">
          {topPosts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <h4 className="text-xl font-semibold text-gray-900">{post.title}</h4>
              <p className="text-gray-700">{post.description}</p>
              <p className="text-gray-700"><strong>Tags:</strong> {post.tags}</p>
              <p className="text-gray-700"><strong>Author:</strong> {post.author.firstName} {[post.author.lastName]}</p>
              <p className="text-gray-700"><strong>Rating:</strong> {post.rating}</p>
              {post.Template && (
                <p className="text-gray-700"><strong>Template:</strong> {post.Template.title}</p>
              )}
            </div>
          ))}
          </div>
        </div>

        {/* Top Templates */}
        <div className="px-4 py-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Top Code Templates</h2>
          <div className="space-y-6">
            {topTemplates.map((template, index) => (
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300" key={index}>
                <h3 className="text-xl font-semibold text-gray-900">{template.title}</h3>
                <p className="text-gray-700">{template.explanation}</p>
                <p className="text-gray-700">{template.tags}</p>
                <p className="text-gray-700">{template.code}</p>
                {/* <p className="text-gray-700">{template.id}</p> */}
              </div>
            ))}
          </div>
        </div>

        {/* Go to Editor Button */}
        <div className="flex justify-center py-8">
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 transition-all duration-300"
          >
            Go to Editor
          </button>
        </div>

        
      </div>
    </>
  );
}
