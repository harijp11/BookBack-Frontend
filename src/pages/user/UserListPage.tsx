
import { UserHeader } from "@/Components/headers/userHeader";
import UserList from "@/Components/user/chat/UserList";



function UserChatListPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">

      <div className="sticky top-0 z-10 shadow-sm bg-white/80 backdrop-blur-sm">
        <UserHeader />
      </div>
      
      
      <main className="max-h-[80vh] overflow-y-auto">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <UserList />
  </div>
</main>
      
     {/* <div className="mt-auto">
        <Footer/>
      </div> */}
    </div>
  );
}

export default  UserChatListPage