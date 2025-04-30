
import SalesManagement from "@/Components/admin/sales/SalesManagement";
import Sidebar from "../../Components/admin/sidebar";



const AdminSalesTypeManagement = () => {

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar  />
       <div className="flex-1 overflow-auto p-6">
         <SalesManagement />
      </div>
    </div>
  );
};

export default AdminSalesTypeManagement
