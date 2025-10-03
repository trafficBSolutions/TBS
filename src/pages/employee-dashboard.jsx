import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Employee Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Link 
            to="/employee-dashboard/work-order"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-xl font-semibold mb-2">Work Order</h2>
              <p className="text-gray-600">Create and manage work orders</p>
            </div>
          </Link>
          
          <Link 
            to="/employee-dashboard/employee-complaint-form"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-xl font-semibold mb-2">Employee Complaint Form</h2>
              <p className="text-gray-600">Submit employee complaints and feedback</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
