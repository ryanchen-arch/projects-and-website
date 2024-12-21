import React, { useState } from "react";
import Select from "react-select";
import axios from "axios";
import { SingleValue } from "react-select";
import { TemplateProvider, useTemplateContext } from "./templateContext";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css"; // Choose a theme or customize your own
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";

interface OptionType {
  value: string;
  label: string;
}

export default function CodeEditor() {
  const { templateCode } = useTemplateContext();
  const [selectedLanguage, setSelectedLanguage] = useState("Javascript");
  const [code, setCode] = useState(templateCode);
  const [input, setInput] = useState(""); // New state for input
  const [output, setOutput] = useState("");

  // Handle language selection
  const handleLanguageChange = (selectedOption: SingleValue<OptionType>) => {
    if (selectedOption) {
      setSelectedLanguage(selectedOption.value);
    }
  };

  // Handle running the code by calling the API
  const handleRunCode = async () => {
    try {
      const res = await fetch("/api/execute/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
          code: code,
          input: input,
        }),
      });
      const result = await res.json(); // Parse the response
      setOutput(result.output || result.error || "An unknown error occurred.");
    } catch (error) {
      console.error(error);
      setOutput("Error running the code.");
    }
  };

  // Syntax highlighting function using Prism.js
  const highlightCode = (code: string) => {
    const language = selectedLanguage.toLowerCase(); // Ensure compatibility with Prism
    return Prism.highlight(code, Prism.languages[language] || Prism.languages.javascript, language);
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-900 text-white font-sans">
      <h1 className="text-4xl mb-6 font-bold text-center">Code Editor</h1>

      <div className="mb-4">
        <Select
          options={[
            { value: "Javascript", label: "JavaScript" },
            { value: "Python", label: "Python" },
            { value: "Java", label: "Java" },
            { value: "C", label: "C" },
            { value: "C++", label: "C++" },
            { value: "Ruby", label: "Ruby" },
            { value: "Go", label: "Go" },
            { value: "Rust", label: "Rust" },
            { value: "PHP", label: "PHP" },
            { value: "C#", label: "C#" },
          ]}
          value={{ value: selectedLanguage, label: selectedLanguage }}
          onChange={handleLanguageChange}
          className="text-black"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-bold text-blue-300">Code</label>
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={highlightCode}
          padding={10}
          className="w-full h-64 border-2 border-gray-700 rounded-md bg-gray-800 text-white font-mono text-lg"
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 16,
          }}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-bold text-blue-300">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-32 p-4 border-2 border-gray-700 rounded-md bg-gray-800 text-white font-mono text-lg"
        ></textarea>
      </div>

      <button
        onClick={handleRunCode}
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200"
      >
        Run Code
      </button>

      {output && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-blue-300">Output</h2>
          <pre className="p-4 bg-gray-800 text-white rounded-md">{output}</pre>
        </div>
      )}
    </div>
  );
}
