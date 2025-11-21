import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Database, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const ProviderDebug = () => {
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [apiUrl, setApiUrl] = useState('https://homehero-synap5e.onrender.com/api');

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    const results = [];

    try {
      // Test 1: Direct API call without filters
      results.push({ test: 'Test 1: GET /providers/ (no filters)', status: 'running' });
      setTestResults([...results]);

      try {
        const response1 = await axiosInstance.get('/providers/');
        results[0] = { 
          test: 'Test 1: GET /providers/ (no filters)', 
          status: 'success', 
          count: response1.data.length,
          data: response1.data,
          providers: response1.data.map(p => ({
            name: p.user?.name,
            email: p.user?.email,
            services: p.services,
            availability: p.availability,
            approved: p.is_approved || p.approved || 'N/A'
          }))
        };
        setAllProviders(response1.data);
      } catch (error) {
        results[0] = { 
          test: 'Test 1: GET /providers/ (no filters)', 
          status: 'failed',
          error: error.response?.data?.detail || error.message
        };
      }
      setTestResults([...results]);

      // Test 2: Search with service filter
      results.push({ test: 'Test 2: GET /providers/?service=plumber', status: 'running' });
      setTestResults([...results]);

      try {
        const response2 = await axiosInstance.get('/providers/?service=plumber');
        results[1] = { 
          test: 'Test 2: GET /providers/?service=plumber', 
          status: 'success', 
          count: response2.data.length,
          providers: response2.data.map(p => p.user?.name)
        };
      } catch (error) {
        results[1] = { 
          test: 'Test 2: GET /providers/?service=plumber', 
          status: 'failed',
          error: error.response?.data?.detail || error.message
        };
      }
      setTestResults([...results]);

      // Test 3: Advanced search
      results.push({ test: 'Test 3: GET /providers/search?service=plumber', status: 'running' });
      setTestResults([...results]);

      try {
        const response3 = await axiosInstance.get('/providers/search?service=plumber');
        results[2] = { 
          test: 'Test 3: GET /providers/search?service=plumber', 
          status: 'success', 
          count: response3.data.length,
          providers: response3.data.map(p => p.user?.name)
        };
      } catch (error) {
        results[2] = { 
          test: 'Test 3: GET /providers/search?service=plumber', 
          status: 'failed',
          error: error.response?.data?.detail || error.message
        };
      }
      setTestResults([...results]);

      // Test 4: Check approval status
      results.push({ test: 'Test 4: Checking approval status', status: 'running' });
      setTestResults([...results]);

      const approvedCount = allProviders.filter(p => {
        return p.is_approved === true || p.approved === true;
      }).length;

      const pendingCount = allProviders.filter(p => {
        return p.is_approved === false || p.approved === false;
      }).length;

      results[3] = { 
        test: 'Test 4: Approval Status Check', 
        status: 'success',
        approved: approvedCount,
        pending: pendingCount,
        total: allProviders.length
      };
      setTestResults([...results]);

      // Test 5: Check for new providers (Beta, Alpha, Gamma)
      results.push({ test: 'Test 5: Looking for new providers', status: 'running' });
      setTestResults([...results]);

      const newProviders = ['beta', 'alpha', 'gamma'];
      const found = {};
      
      newProviders.forEach(name => {
        const provider = allProviders.find(p => 
          p.user?.name?.toLowerCase().includes(name) || 
          p.user?.email?.toLowerCase().includes(name)
        );
        found[name] = provider ? {
          exists: true,
          name: provider.user?.name,
          email: provider.user?.email,
          services: provider.services,
          approved: provider.is_approved || provider.approved,
          availability: provider.availability
        } : { exists: false };
      });

      results[4] = { 
        test: 'Test 5: New Providers Check (Beta, Alpha, Gamma)', 
        status: Object.values(found).some(f => f.exists) ? 'success' : 'failed',
        found: found
      };
      setTestResults([...results]);

      toast.success('Tests completed!');
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Tests failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'success') return 'bg-green-500/10 border-green-500/20 text-green-500';
    if (status === 'failed') return 'bg-red-500/10 border-red-500/20 text-red-500';
    return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
  };

  const getStatusIcon = (status) => {
    if (status === 'success') return <CheckCircle size={20} />;
    if (status === 'failed') return <XCircle size={20} />;
    return <AlertCircle size={20} className="animate-pulse" />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="text-primary-500" size={32} />
              <div>
                <h1 className="text-2xl font-bold mb-1">🔍 Provider Debug Tool</h1>
                <p className="text-dark-muted">Diagnose provider visibility issues</p>
              </div>
            </div>
            <button
              onClick={runTests}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
              Run Tests
            </button>
          </div>
        </div>

        {/* API Endpoint Info */}
        <div className="card bg-blue-500/5 border-blue-500/20">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Search className="text-blue-500" size={20} />
            API Base URL
          </h3>
          <p className="font-mono text-sm bg-dark-bg p-2 rounded">{apiUrl}</p>
        </div>

        {/* Test Results */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  
                  <div className="flex-1">
                    <p className="font-medium mb-1">{result.test}</p>
                    
                    {result.count !== undefined && (
                      <p className="text-sm mb-2">
                        📊 Result Count: <strong>{result.count}</strong> provider(s)
                      </p>
                    )}

                    {result.providers && (
                      <div className="text-sm mb-2">
                        <p className="font-medium mb-1">Providers Found:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.providers.map((name, i) => (
                            <span key={i} className="px-2 py-1 bg-primary-500/10 text-primary-500 rounded text-xs">
                              {typeof name === 'object' ? name.name : name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.approved !== undefined && (
                      <div className="text-sm space-y-1">
                        <p>✅ Approved: <strong>{result.approved}</strong></p>
                        <p>⏳ Pending: <strong>{result.pending}</strong></p>
                        <p>📊 Total: <strong>{result.total}</strong></p>
                      </div>
                    )}

                    {result.found && (
                      <div className="text-sm space-y-2 mt-2">
                        {Object.entries(result.found).map(([name, data]) => (
                          <div key={name} className={`p-3 rounded ${data.exists ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            <p className="font-bold capitalize mb-1">
                              {data.exists ? '✅' : '❌'} {name}
                            </p>
                            {data.exists && (
                              <div className="text-xs space-y-1 pl-4">
                                <p>Name: {data.name}</p>
                                <p>Email: {data.email}</p>
                                <p>Services: {data.services?.join(', ') || 'None'}</p>
                                <p>Approved: {data.approved ? '✅ Yes' : '❌ No'}</p>
                                <p>Available: {data.availability ? '✅ Yes' : '❌ No'}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {result.error && (
                      <p className="text-sm text-red-500 mt-2">❌ Error: {result.error}</p>
                    )}

                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm text-primary-500 cursor-pointer hover:text-primary-400">
                          View Raw Data ({Array.isArray(result.data) ? result.data.length : 1} item(s))
                        </summary>
                        <pre className="mt-2 text-xs bg-dark-bg p-3 rounded overflow-x-auto max-h-96">
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

        {/* All Providers Detail Table */}
        {allProviders.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">
              📋 All Providers in Database ({allProviders.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Services</th>
                    <th className="text-left p-3">Location</th>
                    <th className="text-left p-3">Approved</th>
                    <th className="text-left p-3">Available</th>
                    <th className="text-left p-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {allProviders.map((provider, index) => (
                    <tr key={provider.provider_id} className="border-b border-dark-border hover:bg-dark-hover">
                      <td className="p-3 font-medium">{provider.user?.name || 'N/A'}</td>
                      <td className="p-3 text-dark-muted">{provider.user?.email || 'N/A'}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {provider.services?.map((service, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary-500/10 text-primary-500 rounded text-xs">
                              {service}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-dark-muted">{provider.user?.location || 'N/A'}</td>
                      <td className="p-3">
                        {(provider.is_approved || provider.approved) ? (
                          <span className="text-green-500">✅ Yes</span>
                        ) : (
                          <span className="text-red-500">❌ No</span>
                        )}
                      </td>
                      <td className="p-3">
                        {provider.availability ? (
                          <span className="text-green-500">✅ Yes</span>
                        ) : (
                          <span className="text-red-500">❌ No</span>
                        )}
                      </td>
                      <td className="p-3">₹{provider.pricing || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Troubleshooting Guide */}
        <div className="card bg-yellow-500/5 border-yellow-500/20">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="text-yellow-500" size={20} />
            Common Issues & Solutions
          </h3>
          <div className="space-y-3 text-sm text-dark-muted">
            <div className="p-3 bg-dark-bg rounded">
              <p className="font-bold text-dark-text mb-1">Issue: Provider exists but not showing</p>
              <p className="mb-2">Possible causes:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Not Approved:</strong> Backend might filter out unapproved providers</li>
                <li><strong>Empty Services:</strong> Provider has no services selected</li>
                <li><strong>Availability Off:</strong> Provider marked as unavailable</li>
                <li><strong>Backend Filter:</strong> API filters providers by approval status</li>
              </ul>
            </div>
            <div className="p-3 bg-dark-bg rounded">
              <p className="font-bold text-dark-text mb-1">Solution:</p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                <li>Check if provider is approved (is_approved = true)</li>
                <li>Ensure provider has services selected</li>
                <li>Set availability to true</li>
                <li>Check backend API code for hidden filters</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDebug;