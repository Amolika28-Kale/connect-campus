// pages/admin/Reports.jsx
import { useEffect, useState } from "react";
import { getReportsAPI } from "../services/adminService";
import { AlertCircle, CheckCircle } from "lucide-react";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await getReportsAPI();
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reportId, action) => {
    try {
      // await takeReportActionAPI(reportId, { action });
      fetchReports();
    } catch (error) {
      console.error("Failed to take action:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports 🚨</h1>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report._id} className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={20} className="text-yellow-500" />
                  <span className="font-semibold">Report #{report._id.slice(-6)}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    report.status === "pending" ? "bg-yellow-600" : "bg-green-600"
                  }`}>
                    {report.status}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-1">
                  <span className="text-gray-400">Reporter:</span> {report.reporter?.fullName} ({report.reporter?.email})
                </p>
                <p className="text-gray-300 mb-1">
                  <span className="text-gray-400">Reported:</span> {report.reported?.fullName} ({report.reported?.email})
                </p>
                <p className="text-gray-300 mb-3">
                  <span className="text-gray-400">Reason:</span> {report.reason}
                </p>
              </div>

              {report.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(report._id, "warn")}
                    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                  >
                    Warn
                  </button>
                  <button
                    onClick={() => handleAction(report._id, "suspend")}
                    className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleAction(report._id, "ban")}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                  >
                    Ban
                  </button>
                </div>
              )}

              {report.status === "resolved" && (
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle size={20} />
                  <span>Resolved</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <p className="text-center text-gray-400 py-8">No reports found</p>
        )}
      </div>
    </div>
  );
}

export default Reports;