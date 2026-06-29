import React from 'react';
import TrafficJobsView from './TrafficJobsView';
import WorkOrdersView from './WorkOrdersView';
import QuotesView from './QuotesView';
import ComplaintsView from './ComplaintsView';
import BollardsView from './BollardsView';
import SignShopView from './SignShopView';
import ShopWorkOrdersView from './ShopWorkOrdersView';
import TasksView from './TasksView';
import TimeClockSection from './TimeClockSection';

const AdminViewRenderer = ({
  viewMode,
  // Traffic
  selectedDate, jobs, jobRegionFilter, setJobRegionFilter,
  // Work Orders
  woSelectedDate, woList, setEditingTCWorkOrder,
  // Quotes
  quotesDate, quotesList, successMessage, resendingQuoteId, resendQuote,
  // Complaints
  complaintsDate, complaintsList,
  // Bollards
  bollardDate, bollardList,
  // Sign Shop
  signShopDate, signShopList,
  signShopTitle, setSignShopTitle, signShopCustomer, setSignShopCustomer,
  signShopDesc, setSignShopDesc, signShopPhotos, setSignShopPhotos,
  editingSignShopId, editSignShop, setEditSignShop, editSignShopPhotos, setEditSignShopPhotos,
  addSignShopJob, toggleSignShopComplete, startEditSignShop, cancelEditSignShop,
  saveSignShopEdit, removeSignShopPhoto, deleteSignShopJob, setSignShopPreview,
  // Shop Work Orders
  shopWoDate, shopWoList, handleShopWoApprove, handleShopWoDisapprove, setEditingShopWorkOrder,
  // Tasks
  taskDate, tasks, toggleTaskCompletion, deleteTask,
  // Time Clock
  clockedInList, setClockedInList, pinEmployees, setPinEmployees,
  timeWorked, setTimeWorked, timeWorkedWeekStart, setTimeWorkedWeekStart,
  canEditHours, setViewMode, navigate
}) => {
  switch (viewMode) {
    case 'traffic':
      return (
        <TrafficJobsView
          selectedDate={selectedDate}
          jobs={jobs}
          jobRegionFilter={jobRegionFilter}
          setJobRegionFilter={setJobRegionFilter}
          tasks={tasks}
          toggleTaskCompletion={toggleTaskCompletion}
          deleteTask={deleteTask}
        />
      );
    case 'workorders':
      return (
        <WorkOrdersView
          woSelectedDate={woSelectedDate}
          woList={woList}
          tasks={tasks}
          toggleTaskCompletion={toggleTaskCompletion}
          deleteTask={deleteTask}
          setEditingTCWorkOrder={setEditingTCWorkOrder}
        />
      );
    case 'quotes':
      return (
        <QuotesView
          quotesDate={quotesDate}
          quotesList={quotesList}
          successMessage={successMessage}
          resendingQuoteId={resendingQuoteId}
          resendQuote={resendQuote}
        />
      );
    case 'complaints':
      return (
        <ComplaintsView
          complaintsDate={complaintsDate}
          complaintsList={complaintsList}
          tasks={tasks}
          toggleTaskCompletion={toggleTaskCompletion}
          deleteTask={deleteTask}
        />
      );
    case 'bollards':
      return (
        <BollardsView
          bollardDate={bollardDate}
          bollardList={bollardList}
        />
      );
    case 'signshop':
      return (
        <SignShopView
          signShopDate={signShopDate}
          signShopList={signShopList}
          signShopTitle={signShopTitle}
          setSignShopTitle={setSignShopTitle}
          signShopCustomer={signShopCustomer}
          setSignShopCustomer={setSignShopCustomer}
          signShopDesc={signShopDesc}
          setSignShopDesc={setSignShopDesc}
          signShopPhotos={signShopPhotos}
          setSignShopPhotos={setSignShopPhotos}
          editingSignShopId={editingSignShopId}
          editSignShop={editSignShop}
          setEditSignShop={setEditSignShop}
          editSignShopPhotos={editSignShopPhotos}
          setEditSignShopPhotos={setEditSignShopPhotos}
          addSignShopJob={addSignShopJob}
          toggleSignShopComplete={toggleSignShopComplete}
          startEditSignShop={startEditSignShop}
          cancelEditSignShop={cancelEditSignShop}
          saveSignShopEdit={saveSignShopEdit}
          removeSignShopPhoto={removeSignShopPhoto}
          deleteSignShopJob={deleteSignShopJob}
          setSignShopPreview={setSignShopPreview}
        />
      );
    case 'shopwo':
      return (
        <ShopWorkOrdersView
          shopWoDate={shopWoDate}
          shopWoList={shopWoList}
          handleShopWoApprove={handleShopWoApprove}
          handleShopWoDisapprove={handleShopWoDisapprove}
          setEditingShopWorkOrder={setEditingShopWorkOrder}
        />
      );
    case 'tasks':
      return (
        <TasksView
          taskDate={taskDate}
          tasks={tasks}
          deleteTask={deleteTask}
          toggleTaskCompletion={toggleTaskCompletion}
        />
      );
    case 'timeclock':
      return (
        <TimeClockSection
          clockedInList={clockedInList}
          setClockedInList={setClockedInList}
          pinEmployees={pinEmployees}
          setPinEmployees={setPinEmployees}
          timeWorked={timeWorked}
          setTimeWorked={setTimeWorked}
          timeWorkedWeekStart={timeWorkedWeekStart}
          setTimeWorkedWeekStart={setTimeWorkedWeekStart}
          canEditHours={canEditHours}
          setViewMode={setViewMode}
          navigate={navigate}
        />
      );
    default:
      return null;
  }
};

export default AdminViewRenderer;
