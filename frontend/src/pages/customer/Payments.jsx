import DashboardLayout from "../../components/layout/DashboardLayout";

const Payments = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Payments</h1>
          <p className="text-dark-muted">
            Manage your payments and invoices (coming soon)
          </p>
        </div>

        <div className="card">
          <h3 className="font-bold mb-2">Payments are not yet enabled</h3>
          <p className="text-sm text-dark-muted mb-4">
            We haven't connected a payment provider yet. For now, you can view
            your bookings and mark services complete. When payments are enabled,
            you'll be able to pay securely from here.
          </p>

          <ul className="list-disc list-inside text-sm text-dark-muted space-y-2">
            <li>Secure card payments (coming soon)</li>
            <li>Invoice history (coming soon)</li>
            <li>Refunds and disputes (coming soon)</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
