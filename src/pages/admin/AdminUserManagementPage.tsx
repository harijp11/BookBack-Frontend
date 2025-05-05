
import Sidebar from "../../Components/admin/sidebar";
import UserManagement from "../../Components/admin/UserManagement"

const AdminUserManagement = () => {

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar  />
       <div className="flex-1 overflow-auto p-6">
         <UserManagement />
      </div>
    </div>
  );
};

export default AdminUserManagement
