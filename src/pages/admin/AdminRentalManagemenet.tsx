
import Sidebar from "../../Components/admin/sidebar";
import RentalManagement from "@/Components/admin/rentals/RentalManagement";


const AdminRentalTypeManagement = () => {

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar  />
       <div className="flex-1 overflow-auto p-6">
         <RentalManagement />
      </div>
    </div>
  );
};

export default AdminRentalTypeManagement
