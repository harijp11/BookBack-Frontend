// import { Outlet } from "react-router-dom";
// import { ClientHeader } from "../headers/ClientHeader";
// import { useClientProfileQuery } from "@/hooks/client/useClientProfile";
// import { useEffect, useState } from "react";
// import { User } from "@/services/user/userService";
// import { Spinner } from "@/Components/ui/Spinner";

// function UserLayout() {
//   const { data, isLoading } = useClientProfileQuery();
//   const [clientData, setClientData] = useState<User | null>(null);

//   useEffect(() => {
//     if (data) {
//       setClientData(data.client);
//     }
//   }, [data]);

//   if (isLoading) {
//     return <Spinner />;
//   }

//   if (!clientData) {
//     return null;
//   }

//   return (
//     <div>
//       <div className="min-h-screen bg-background">
//         <ClientHeader client={clientData} />
//         <Outlet
//           context={{
//             clientData,
//             setClientData,
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// export default UserLayout;
