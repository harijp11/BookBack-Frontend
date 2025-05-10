
import ReturnRejectionRequestPage from "@/Components/admin/returnRejectionRequest/ReturnRejectionRequest";
import Sidebar from "../../Components/admin/sidebar";



const AdminReturnRejectionRequestPage = () => {

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar  />
       <div className="flex-1 overflow-auto p-6">
         <ReturnRejectionRequestPage />
      </div>
    </div>
  );
};

export default AdminReturnRejectionRequestPage