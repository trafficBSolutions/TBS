import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  traffic = {}, workOrders = {}, complaints = {}, bollards = {},
  quotes = {}, signShop = {}, shopWorkOrders = {}, timeClock = {},
  tasks = {},
  setEditingTCWorkOrder, setEditingShopWorkOrder
}) => {
  const navigate = useNavigate();

  switch (viewMode) {
    case 'traffic':
      return (
        <TrafficJobsView
          selectedDate={traffic.selectedDate}
          jobs={traffic.jobs}
          jobRegionFilter={traffic.jobRegionFilter}
          setJobRegionFilter={traffic.setJobRegionFilter}
          tasks={tasks.tasks}
          toggleTaskCompletion={tasks.toggleTaskCompletion}
          deleteTask={tasks.deleteTask}
        />
      );
    case 'workorders':
      return (
        <WorkOrdersView
          woSelectedDate={workOrders.woSelectedDate}
          woList={workOrders.woList}
          tasks={tasks.tasks}
          toggleTaskCompletion={tasks.toggleTaskCompletion}
          deleteTask={tasks.deleteTask}
          setEditingTCWorkOrder={setEditingTCWorkOrder}
        />
      );
    case 'quotes':
      return (
        <QuotesView
          quotesDate={quotes.quotesDate}
          quotesList={quotes.quotesList}
          successMessage={quotes.successMessage}
          resendingQuoteId={quotes.resendingQuoteId}
          resendQuote={quotes.resendQuote}
        />
      );
    case 'complaints':
      return (
        <ComplaintsView
          complaintsDate={complaints.complaintsDate}
          complaintsList={complaints.complaintsList}
          tasks={tasks.tasks}
          toggleTaskCompletion={tasks.toggleTaskCompletion}
          deleteTask={tasks.deleteTask}
        />
      );
    case 'bollards':
      return (
        <BollardsView
          bollardDate={bollards.bollardDate}
          bollardList={bollards.bollardList}
        />
      );
    case 'signshop':
      return (
        <SignShopView
          signShopDate={signShop.signShopDate}
          signShopList={signShop.signShopList}
          signShopTitle={signShop.signShopTitle}
          setSignShopTitle={signShop.setSignShopTitle}
          signShopCustomer={signShop.signShopCustomer}
          setSignShopCustomer={signShop.setSignShopCustomer}
          signShopDesc={signShop.signShopDesc}
          setSignShopDesc={signShop.setSignShopDesc}
          signShopPhotos={signShop.signShopPhotos}
          setSignShopPhotos={signShop.setSignShopPhotos}
          editingSignShopId={signShop.editingSignShopId}
          editSignShop={signShop.editSignShop}
          setEditSignShop={signShop.setEditSignShop}
          editSignShopPhotos={signShop.editSignShopPhotos}
          setEditSignShopPhotos={signShop.setEditSignShopPhotos}
          addSignShopJob={signShop.addSignShopJob}
          toggleSignShopComplete={signShop.toggleSignShopComplete}
          startEditSignShop={signShop.startEditSignShop}
          cancelEditSignShop={signShop.cancelEditSignShop}
          saveSignShopEdit={signShop.saveSignShopEdit}
          removeSignShopPhoto={signShop.removeSignShopPhoto}
          deleteSignShopJob={signShop.deleteSignShopJob}
          setSignShopPreview={signShop.setSignShopPreview}
        />
      );
    case 'shopwo':
      return (
        <ShopWorkOrdersView
          shopWoDate={shopWorkOrders.shopWoDate}
          shopWoList={shopWorkOrders.shopWoList}
          handleShopWoApprove={shopWorkOrders.handleShopWoApprove}
          handleShopWoDisapprove={shopWorkOrders.handleShopWoDisapprove}
          setEditingShopWorkOrder={setEditingShopWorkOrder}
        />
      );
    case 'tasks':
      return (
        <TasksView
          taskDate={tasks.taskDate}
          tasks={tasks.tasks}
          taskText={tasks.taskText}
          setTaskText={tasks.setTaskText}
          isTaskPublic={tasks.isTaskPublic}
          setIsTaskPublic={tasks.setIsTaskPublic}
          addTask={tasks.addTask}
          deleteTask={tasks.deleteTask}
          toggleTaskCompletion={tasks.toggleTaskCompletion}
        />
      );
    case 'timeclock':
      return (
        <TimeClockSection
          clockedInList={timeClock.clockedInList}
          setClockedInList={timeClock.setClockedInList}
          pinEmployees={timeClock.pinEmployees}
          setPinEmployees={timeClock.setPinEmployees}
          timeWorked={timeClock.timeWorked}
          setTimeWorked={timeClock.setTimeWorked}
          timeWorkedWeekStart={timeClock.timeWorkedWeekStart}
          setTimeWorkedWeekStart={timeClock.setTimeWorkedWeekStart}
          canEditHours={timeClock.canEditHours}
          setViewMode={() => {}}
          navigate={navigate}
        />
      );
    default:
      return null;
  }
};

export default AdminViewRenderer;
