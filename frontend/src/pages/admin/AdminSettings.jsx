import DashboardLayout from "../../components/layout/DashboardLayout";

const AdminSettings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Admin Settings
          </h1>
          <p className="text-dark-muted">
            Administrative settings (placeholder)
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-dark-muted">
            This area will host global configuration tools.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
