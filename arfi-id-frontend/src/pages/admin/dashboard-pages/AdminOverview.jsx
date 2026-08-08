import React from 'react';

const MetricCard = ({ title, value, hint }) => (
  <div className="card-elevated p-5">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
    <p className="text-xs text-muted-foreground mt-2">{hint}</p>
  </div>
);

const AdminOverview = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Admin Overview</h2>
      <p className="text-muted-foreground mt-1">Platform health, access posture, and admin activity.</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Total Users" value="10" hint="+2 this week" />
      <MetricCard title="Active Projects" value="5" hint="2 pending review" />
      <MetricCard title="Critical Alerts" value="1" hint="Needs action" />
      <MetricCard title="Pending Requests" value="1" hint="Role & access approvals" />

    </div>

    <div className="card-elevated p-6">
      <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      <div className="mt-4 space-y-3">
        <p className="text-sm text-muted-foreground">New admin invitation sent to arfi.id@faizarfi.dev</p>
        <p className="text-sm text-muted-foreground">Security policy updated for OAuth token expiry</p>
        <p className="text-sm text-muted-foreground">Role escalation request approved for Project Atlas</p>
      </div>
    </div>
  </div>
);

export default AdminOverview;
