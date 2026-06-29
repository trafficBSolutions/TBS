import React from 'react';
import DatePicker from 'react-datepicker';

const AdminCalendar = ({
  viewMode,
  traffic = {}, workOrders = {}, complaints = {}, bollards = {},
  quotes = {}, signShop = {}, shopWorkOrders = {}, tasks = {}
}) => {
  const getSelected = () => {
    switch (viewMode) {
      case 'traffic': return traffic.selectedDate;
      case 'workorders': return workOrders.woSelectedDate;
      case 'complaints': return complaints.complaintsDate;
      case 'quotes': return quotes.quotesDate;
      case 'bollards': return bollards.bollardDate;
      case 'signshop': return signShop.signShopDate;
      case 'shopwo': return shopWorkOrders.shopWoDate;
      default: return tasks.taskDate;
    }
  };

  const handleChange = (date) => {
    switch (viewMode) {
      case 'traffic': traffic.setSelectedDate?.(date); break;
      case 'workorders': workOrders.setWoSelectedDate?.(date); break;
      case 'complaints': complaints.setComplaintsDate?.(date); break;
      case 'quotes': quotes.setQuotesDate?.(date); break;
      case 'bollards': bollards.setBollardDate?.(date); break;
      case 'signshop': signShop.setSignShopDate?.(date); break;
      case 'shopwo': shopWorkOrders.setShopWoDate?.(date); break;
      default: tasks.setTaskDate?.(date);
    }
  };

  const handleMonthChange = (date) => {
    if (traffic.setCalendarViewDate) traffic.setCalendarViewDate(date);
    switch (viewMode) {
      case 'traffic': traffic.fetchMonthlyJobs?.(date, traffic.jobRegionFilter); break;
      case 'workorders': workOrders.fetchMonthlyWorkOrders?.(date); break;
      case 'complaints': complaints.fetchMonthlyComplaints?.(date); break;
      case 'quotes': quotes.fetchMonthlyQuotes?.(date); break;
      case 'bollards': bollards.fetchMonthlyBollards?.(date); break;
      case 'signshop': signShop.fetchMonthlySignShop?.(date); break;
      case 'shopwo': shopWorkOrders.fetchMonthlyShopWo?.(date); break;
      default: tasks.fetchTasks?.();
    }
  };

  const getDataSource = () => {
    switch (viewMode) {
      case 'traffic': return traffic.monthlyJobs || {};
      case 'workorders': return workOrders.woMonthly || {};
      case 'complaints': return complaints.complaintsMonthly || {};
      case 'quotes': return quotes.quotesMonthly || {};
      case 'bollards': return bollards.bollardMonthly || {};
      case 'signshop': return signShop.signShopMonthly || {};
      case 'shopwo': return shopWorkOrders.shopWoMonthly || {};
      default: return tasks.tasks || {};
    }
  };

  const getLabel = (count) => {
    switch (viewMode) {
      case 'traffic': return `Jobs ${count}/10`;
      case 'workorders': return `Work Orders ${count}`;
      case 'complaints': return `Complaints ${count}`;
      case 'quotes': return `Quotes ${count}`;
      case 'bollards': return `Bollard Quotes ${count}`;
      case 'signshop': return `Sign Jobs ${count}`;
      case 'shopwo': return `Shop WOs ${count}`;
      default: return `Tasks ${count}`;
    }
  };

  const dataSource = getDataSource();

  return (
    <DatePicker
      selected={getSelected()}
      onChange={handleChange}
      onMonthChange={handleMonthChange}
      calendarClassName="admin-date-picker"
      dateFormat="MMMM d, yyyy"
      inline
      formatWeekDay={(nameOfDay) => {
        const map = { Su: 'Sunday', Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday' };
        return map[nameOfDay] || nameOfDay;
      }}
      dayClassName={(date) => {
        const dateStr = date.toISOString().split('T')[0];
        const items = dataSource[dateStr];
        return items && items.length > 0 ? 'has-jobs' : '';
      }}
      renderDayContents={(day, date) => {
        const dateStr = date.toISOString().split('T')[0];
        const items = dataSource[dateStr];
        const itemCount = items ? items.length : 0;
        return (
          <div className="calendar-day-kiss">
            <div className="day-number">{day}</div>
            {itemCount > 0 && (
              <div
                className={viewMode === 'tasks' ? 'task-count' : 'job-count'}
                style={viewMode === 'traffic' && itemCount >= 10 ? { background: '#f44336', color: '#fff' } : {}}
              >
                {getLabel(itemCount)}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default AdminCalendar;
