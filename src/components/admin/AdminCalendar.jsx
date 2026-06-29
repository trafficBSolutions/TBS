import React from 'react';
import DatePicker from 'react-datepicker';

const AdminCalendar = ({
  viewMode, selectedDate, woSelectedDate, complaintsDate, quotesDate,
  bollardDate, signShopDate, shopWoDate, taskDate,
  setSelectedDate, setWoSelectedDate, setComplaintsDate, setQuotesDate,
  setBollardDate, setSignShopDate, setShopWoDate, setTaskDate,
  setCalendarViewDate, fetchMonthlyJobs, fetchMonthlyWorkOrders,
  fetchMonthlyComplaints, fetchMonthlyQuotes, fetchMonthlyBollards,
  fetchMonthlySignShop, fetchMonthlyShopWo, fetchTasks,
  jobRegionFilter, monthlyJobs, woMonthly, complaintsMonthly,
  quotesMonthly, bollardMonthly, signShopMonthly, shopWoMonthly, tasks
}) => {
  const getSelected = () => {
    switch (viewMode) {
      case 'traffic': return selectedDate;
      case 'workorders': return woSelectedDate;
      case 'complaints': return complaintsDate;
      case 'quotes': return quotesDate;
      case 'bollards': return bollardDate;
      case 'signshop': return signShopDate;
      case 'shopwo': return shopWoDate;
      default: return taskDate;
    }
  };

  const handleChange = (date) => {
    switch (viewMode) {
      case 'traffic': setSelectedDate(date); break;
      case 'workorders': setWoSelectedDate(date); break;
      case 'complaints': setComplaintsDate(date); break;
      case 'quotes': setQuotesDate(date); break;
      case 'bollards': setBollardDate(date); break;
      case 'signshop': setSignShopDate(date); break;
      case 'shopwo': setShopWoDate(date); break;
      default: setTaskDate(date);
    }
  };

  const handleMonthChange = (date) => {
    setCalendarViewDate(date);
    switch (viewMode) {
      case 'traffic': fetchMonthlyJobs(date, jobRegionFilter); break;
      case 'workorders': fetchMonthlyWorkOrders(date); break;
      case 'complaints': fetchMonthlyComplaints(date); break;
      case 'quotes': fetchMonthlyQuotes(date); break;
      case 'bollards': fetchMonthlyBollards(date); break;
      case 'signshop': fetchMonthlySignShop(date); break;
      case 'shopwo': fetchMonthlyShopWo(date); break;
      default: fetchTasks();
    }
  };

  const getDataSource = () => {
    switch (viewMode) {
      case 'traffic': return monthlyJobs;
      case 'workorders': return woMonthly;
      case 'complaints': return complaintsMonthly;
      case 'quotes': return quotesMonthly;
      case 'bollards': return bollardMonthly;
      case 'signshop': return signShopMonthly;
      case 'shopwo': return shopWoMonthly;
      default: return tasks;
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
        return dataSource[dateStr]?.length > 0 ? 'has-jobs' : '';
      }}
      renderDayContents={(day, date) => {
        const dateStr = date.toISOString().split('T')[0];
        const itemCount = dataSource[dateStr]?.length || 0;
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
