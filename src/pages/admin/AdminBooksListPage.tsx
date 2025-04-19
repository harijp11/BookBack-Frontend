
import AdminPaginatedBooksComponent from "@/Components/admin/book/getAllPaginatedAdminBooks";
import Sidebar from "../../Components/admin/sidebar";


const AdminBookMangement = () => {

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar  />
       <div className="flex-1 overflow-auto p-6">
         <AdminPaginatedBooksComponent />
      </div>
    </div>
  );
};

export default AdminBookMangement
