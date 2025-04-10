import Footer from "@/Components/footer/userFooter";
import { UserHeader } from "@/Components/headers/userHeader";
import ProfilePage from "@/Components/user/profile/userProfile";

function UserProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">

      <div className="sticky top-0 z-10 shadow-sm bg-white/80 backdrop-blur-sm">
        <UserHeader />
      </div>
      
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProfilePage />
        </div>
      </main>
      
      
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <Footer/>
    </div>
  );
}

export default UserProfilePage;
