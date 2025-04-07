
import Sidebar from "../../Components/admin/sidebar";
import Dashboard from "../../Components/admin/Dashboard";

const AdminDashboard = () => {

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar  />
       <div className="flex-1 overflow-auto p-6">
         <Dashboard />
      </div>
    </div>
  );
};

export default AdminDashboard;
