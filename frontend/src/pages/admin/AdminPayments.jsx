import DashboardLayout from "../../components/layout/DashboardLayout";

const AdminPayments = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Payments (Admin)
          </h1>
          <p className="text-dark-muted">
            Payments dashboard for administrators (placeholder)
          </p>
        </div>

        <div className="card">
          <h3 className="font-bold mb-2">Payment features coming soon</h3>
          <p className="text-sm text-dark-muted mb-4">
            This area will provide admin-level controls for transactions,
            payouts, and reconciliation. For now it's a placeholder to keep the
            navigation functional.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPayments;
