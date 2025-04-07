
import Sidebar from "../../Components/admin/sidebar";
import DealTypeManagement from "@/Components/admin/dealtypes/DealTypeManagement";


const AdminDealTypeManagement = () => {

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar  />
       <div className="flex-1 overflow-auto p-6">
         <DealTypeManagement />
      </div>
    </div>
  );
};

export default AdminDealTypeManagement
