import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../api/axiosConfig";
import toast from "react-hot-toast";

const ProviderDebug = () => {
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    const results = [];

    try {
      // Test 1: Get all providers (no filters)
      results.push({ test: "Fetching all providers...", status: "running" });
      setTestResults([...results]);

      const response1 = await axiosInstance.get("/providers/");
      results[0] = {
        test: "GET /providers/",
        status: "success",
        count: response1.data.length,
        data: response1.data,
      };
      setAllProviders(response1.data);
      setTestResults([...results]);

      // Test 2: Search for plumber service
      results.push({ test: "Searching for plumbers...", status: "running" });
      setTestResults([...results]);

      const response2 = await axiosInstance.get("/providers/?service=plumber");
      results[1] = {
        test: "GET /providers/?service=plumber",
        status: "success",
        count: response2.data.length,
        data: response2.data,
      };
      setTestResults([...results]);

      // Test 3: Advanced search
      results.push({ test: "Advanced search test...", status: "running" });
      setTestResults([...results]);

      const response3 = await axiosInstance.get(
        "/providers/search?service=plumber"
      );
      results[2] = {
        test: "GET /providers/search?service=plumber",
        status: "success",
        count: response3.data.length,
        data: response3.data,
      };
      setTestResults([...results]);

      // Test 4: Check for Beta specifically
      results.push({
        test: 'Looking for "Beta" provider...',
        status: "running",
      });
      setTestResults([...results]);

      const betaProvider = response1.data.find((p) =>
        p.user?.name?.toLowerCase().includes("beta")
      );

      results[3] = {
        test: 'Search for "Beta" in results',
        status: betaProvider ? "success" : "failed",
        found: betaProvider ? "YES" : "NO",
        data: betaProvider || null,
      };
      setTestResults([...results]);

      toast.success("Tests completed!");
    } catch (error) {
      console.error("Test error:", error);
      results.push({
        test: "Error occurred",
        status: "failed",
        error: error.message,
      });
      setTestResults([...results]);
      toast.error("Some tests failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                🔍 Provider Debug Tool
              </h1>
              <p className="text-dark-muted">
                Check if providers are registered correctly
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
              Run Tests
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.status === "success"
                    ? "bg-green-500/10 border-green-500/20"
                    : result.status === "failed"
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-yellow-500/10 border-yellow-500/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.status === "success" && (
                    <CheckCircle
                      className="text-green-500 flex-shrink-0"
                      size={20}
                    />
                  )}
                  {result.status === "failed" && (
                    <XCircle className="text-red-500 flex-shrink-0" size={20} />
                  )}
                  {result.status === "running" && (
                    <AlertCircle
                      className="text-yellow-500 flex-shrink-0 animate-pulse"
                      size={20}
                    />
                  )}

                  <div className="flex-1">
                    <p className="font-medium mb-1">{result.test}</p>
                    {result.count !== undefined && (
                      <p className="text-sm text-dark-muted">
                        Found: {result.count} provider(s)
                      </p>
                    )}
                    {result.found !== undefined && (
                      <p className="text-sm text-dark-muted">
                        Beta Found: <strong>{result.found}</strong>
                      </p>
                    )}
                    {result.error && (
                      <p className="text-sm text-red-500">
                        Error: {result.error}
                      </p>
                    )}
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm text-primary-500 cursor-pointer">
                          View Data (
                          {Array.isArray(result.data) ? result.data.length : 1}{" "}
                          item(s))
                        </summary>
                        <pre className="mt-2 text-xs bg-dark-bg p-3 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Providers List */}
        {allProviders.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">
              All Registered Providers ({allProviders.length})
            </h2>
            <div className="space-y-3">
              {allProviders.map((provider, index) => (
                <div
                  key={provider.provider_id}
                  className="p-4 bg-dark-bg rounded-lg border border-dark-border"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-dark-muted">Name</p>
                      <p className="font-bold">
                        {provider.user?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-dark-muted">Services</p>
                      <p className="font-medium">
                        {provider.services?.join(", ") || "None"}
                      </p>
                    </div>
                    <div>
                      <p className="text-dark-muted">Location</p>
                      <p className="font-medium">
                        {provider.user?.location || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-dark-muted">Available</p>
                      <p
                        className={
                          provider.availability
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {provider.availability ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  <details className="mt-3">
                    <summary className="text-xs text-primary-500 cursor-pointer">
                      View Full Data
                    </summary>
                    <pre className="mt-2 text-xs bg-dark-card p-3 rounded overflow-x-auto">
                      {JSON.stringify(provider, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="card bg-primary-500/5 border-primary-500">
          <h3 className="font-bold mb-2">💡 What to Check</h3>
          <ul className="text-sm text-dark-muted space-y-1 list-disc list-inside">
            <li>Does "Beta" appear in the All Registered Providers list?</li>
            <li>
              Are the services correctly set for Beta? (should include
              "plumber")
            </li>
            <li>Is Beta's availability set to "Yes"?</li>
            <li>Is Beta's location set correctly?</li>
            <li>Check the console for any API errors</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDebug;
