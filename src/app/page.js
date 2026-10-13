'use client';

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, Wallet, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    // Fetch the secured Spring Boot endpoint using the Java JWT
    if (status === "authenticated" && session?.accessToken) {
      fetch("http://localhost:8080/api/analytics/dashboard", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setMetrics(data))
        .catch((err) => console.error("Failed to fetch metrics", err));
    }
  }, [status, session, router]);

  if (status === "loading" || !metrics) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 animate-pulse">Loading secure enterprise data...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Research Command Center</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-500"/>
              Authenticated as: <span className="font-medium text-slate-700">{session.user.email}</span> 
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold ml-2">{session.user.role}</span>
            </p>
          </div>
          <button 
            onClick={() => signOut()} 
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="w-6 h-6"/></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Projects</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.totalProjects}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-lg"><BarChart3 className="w-6 h-6"/></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Publications</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.totalPublications}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet className="w-6 h-6"/></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Grant Funding</p>
              <p className="text-2xl font-bold text-slate-900">${metrics.totalGrantFunding?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}