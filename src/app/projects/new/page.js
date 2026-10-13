'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [domain, setDomain] = useState('');
  const [summary, setSummary] = useState('');
  
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // AI Function 1: Domain Classification
  const handleClassifyDomain = async () => {
    if (!title || !description) return alert("Please enter a title and description first.");
    setIsClassifying(true);
    try {
      const res = await fetch("http://localhost:8080/api/projects/ai/classify-domain", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ title, description })
      });
      const data = await res.text(); // Assuming backend returns plain text
      setDomain(data);
    } catch (error) {
      console.error("Classification failed:", error);
    }
    setIsClassifying(false);
  };

  // AI Function 2: Abstract Summarization
  const handleSummarize = async () => {
    if (!abstractText) return alert("Please paste an abstract first.");
    setIsSummarizing(true);
    try {
      const res = await fetch("http://localhost:8080/api/projects/ai/summarize", { // Adjust endpoint if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ abstractText })
      });
      const data = await res.text();
      setSummary(data);
    } catch (error) {
      console.error("Summarization failed:", error);
    }
    setIsSummarizing(false);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    
    // Package all the state variables into a JSON object
    const projectPayload = {
      title: title,
      description: description,
      domain: domain,
      abstractText: abstractText,
      summary: summary
    };

    try {
      const res = await fetch("http://localhost:8080/api/projects", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(projectPayload)
      });

      if (res.ok) {
        // Success! Redirect back to the dashboard and refresh the data
        router.push('/');
        router.refresh();
      } else {
        const errorText = await res.text();
        alert(`Failed to save project: ${errorText}`);
      }
    } catch (error) {
      console.error("Database save failed:", error);
      alert("Network error: Could not reach the Spring Boot backend.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Initialize Research Project</h1>
              <p className="text-slate-500 text-sm mt-1">Leverage Gemini AI to format and classify enterprise research data.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProject} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Optimizing In-Memory Caching"
                required
              />
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Technical Description</label>
              <div className="flex gap-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                  placeholder="Analyzing latency reduction in microservices..."
                  required
                />
              </div>
            </div>

            {/* AI Classification Block */}
            <div className="space-y-4 md:col-span-2 bg-blue-50/50 p-6 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-blue-900">Research Domain (AI Classified)</label>
                <button
                  type="button"
                  onClick={handleClassifyDomain}
                  disabled={isClassifying}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {isClassifying ? "Analyzing..." : "Auto-Classify Domain"}
                </button>
              </div>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-blue-900 font-medium"
                placeholder="AI will detect domain..."
              />
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Raw Abstract Data</label>
              <textarea
                value={abstractText}
                onChange={(e) => setAbstractText(e.target.value)}
                className="w-full text-slate-900 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                placeholder="Paste the full, unformatted academic abstract here..."
              />
            </div>

            {/* AI Summarization Block */}
            <div className="space-y-4 md:col-span-2 bg-purple-50/50 p-6 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-purple-900">Executive Summary (AI Generated)</label>
                <button
                  type="button"
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {isSummarizing ? "Synthesizing..." : "Generate Summary"}
                </button>
              </div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white text-purple-900 min-h-[100px]"
                placeholder="AI will generate a 3-sentence executive summary..."
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Project to Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}