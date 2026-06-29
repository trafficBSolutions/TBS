import React, { useState } from 'react';
import '../css/admin.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

import {
  useAdminAuth,
  useTasks,
  useTrafficJobs,
  useWorkOrders,
  useComplaints,
  useBollards,
  useQuotes,
  useSignShop,
  useShopWorkOrders,
  useTimeClock,
} from '../hooks/admin';

import {
  AdminTopBar,
  AdminCalendar,
  AdminViewRenderer,
  TrafficPlansSection,
  ApplicantsSection,
  LeaveRequestsSection,
  PendingShopWoSection,
  AdminFooter,
} from '../components/admin';

import {
  EditTCWorkOrderModal,
  EditShopWorkOrderModal,
} from '../components/EditWorkOrderModal';

const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState('traffic');
  const [editingTCWorkOrder, setEditingTCWorkOrder] = useState(null);
  const [editingShopWorkOrder, setEditingShopWorkOrder] = useState(null);

  const auth = useAdminAuth();
  const tasks = useTasks(auth.adminName);
  const traffic = useTrafficJobs();
  const workOrders = useWorkOrders();
  const complaints = useComplaints();
  const bollards = useBollards();
  const quotes = useQuotes(auth.allowedForQuotes);
  const signShop = useSignShop(auth.allowedForSignShop);
  const shopWorkOrders = useShopWorkOrders(auth.allowedForShopWo);
  const timeClock = useTimeClock(auth.canViewTimeClock);

  if (!auth.isAdmin) {
    return (
      <>
        <Header activePage="/admin-dashboard" />
        <div className="admin-dashboard">
          <h2>Please log in as an admin.</h2>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header activePage="/admin-dashboard" />

      <main className="admin-dashboard">
        <AdminTopBar
          adminName={auth.adminName}
          viewMode={viewMode}
          setViewMode={setViewMode}
          monthlyTotalJobs={traffic.monthlyTotalJobs}
          monthlyTotalWorkOrders={workOrders.monthlyTotalWorkOrders}
          calendarViewDate={traffic.calendarViewDate}
          permissions={auth}
        />

        <AdminCalendar
          viewMode={viewMode}
          traffic={traffic}
          workOrders={workOrders}
          complaints={complaints}
          bollards={bollards}
          quotes={quotes}
          signShop={signShop}
          shopWorkOrders={shopWorkOrders}
          tasks={tasks}
        />

        <AdminViewRenderer
          viewMode={viewMode}
          traffic={traffic}
          workOrders={workOrders}
          complaints={complaints}
          bollards={bollards}
          quotes={quotes}
          signShop={signShop}
          shopWorkOrders={shopWorkOrders}
          timeClock={timeClock}
          tasks={tasks}
          setEditingTCWorkOrder={setEditingTCWorkOrder}
          setEditingShopWorkOrder={setEditingShopWorkOrder}
        />

        <ApplicantsSection />
        <TrafficPlansSection />
        <LeaveRequestsSection />
        <PendingShopWoSection />
        <AdminFooter />
      </main>

      {editingTCWorkOrder && (
        <EditTCWorkOrderModal
          workOrder={editingTCWorkOrder}
          onClose={() => setEditingTCWorkOrder(null)}
          onSaved={workOrders.refreshSelectedDay}
        />
      )}

      {editingShopWorkOrder && (
        <EditShopWorkOrderModal
          workOrder={editingShopWorkOrder}
          onClose={() => setEditingShopWorkOrder(null)}
          onSaved={shopWorkOrders.refreshSelectedDay}
        />
      )}

      <Footer />
    </>
  );
};

export default AdminDashboard;
