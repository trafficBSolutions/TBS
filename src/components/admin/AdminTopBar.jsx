import React from 'react';
import axios from 'axios';

const AdminTopBar = ({
  adminName, isAdmin, monthlyTotalJobs, monthlyTotalWorkOrders,
  jobRegionFilter, calendarViewDate, viewMode, setViewMode,
  allowedForQuotes, allowedForSignShop, allowedForShopWo, isSalaryAdmin,
  clockLocation, initTimeClock
}) => {
  if (!isAdmin) return null;

  return (
    <div className="zone-topbar">
      <h1 className="welcome">Welcome, {adminName}</h1>
      <div className="stats-row">
        <div className="stat-chip"><span className="stat-label">Jobs This Month{jobRegionFilter ? ` (${jobRegionFilter === 'north' ? 'North' : 'South'} GA)` : ''}</span><span className="stat-value">{monthlyTotalJobs}</span></div>
        <div className="stat-chip"><span className="stat-label">Work Orders</span><span className="stat-value">{monthlyTotalWorkOrders}</span></div>
        <div className="stat-chip"><span className="stat-label">{calendarViewDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</span><span className="stat-value">📅</span></div>
      </div>
      <div className="view-toggle">
        <button className={`btn ${viewMode === 'traffic' ? 'active' : ''}`} onClick={() => setViewMode('traffic')}>Traffic Control Jobs</button>
        <button className={`btn ${viewMode === 'workorders' ? 'active' : ''}`} onClick={() => setViewMode('workorders')}>Work Orders</button>
        {allowedForQuotes && (
          <button className={`btn ${viewMode === 'quotes' ? 'active' : ''}`} onClick={() => setViewMode('quotes')}>Material WorX</button>
        )}
        <button className={`btn ${viewMode === 'bollards' ? 'active' : ''}`} onClick={() => setViewMode('bollards')}>Bollards/Wheels</button>
        {allowedForSignShop && (
          <button className={`btn ${viewMode === 'signshop' ? 'active' : ''}`} onClick={() => setViewMode('signshop')}>Sign Shop</button>
        )}
        {allowedForShopWo && (
          <button className={`btn ${viewMode === 'shopwo' ? 'active' : ''}`} onClick={() => setViewMode('shopwo')}>Shop Work Orders</button>
        )}
        <button className={`btn ${viewMode === 'complaints' ? 'active' : ''}`} onClick={() => setViewMode('complaints')}>Complaints</button>
        <button className={`btn ${viewMode === 'tasks' ? 'active' : ''}`} onClick={() => setViewMode('tasks')}>Tasks</button>
        {isSalaryAdmin && (
          <button className={`btn ${viewMode === 'timeclock' ? 'active' : ''}`} onClick={() => { setViewMode('timeclock'); initTimeClock(); }}>Time Clock</button>
        )}
      </div>
    </div>
  );
};

export default AdminTopBar;
