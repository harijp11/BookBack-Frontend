
import CategoryManagement from "@/Components/admin/category/CategoryManagement";
import Sidebar from "../../Components/admin/sidebar";


const AdminCategoryManagement = () => {

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar  />
       <div className="flex-1 overflow-auto p-6">
         <CategoryManagement />
      </div>
    </div>
  );
};

export default AdminCategoryManagement
