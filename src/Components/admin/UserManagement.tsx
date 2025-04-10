// components/UserManagement.tsx
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserIcon, Mail, Phone, Check, X } from "lucide-react";
import { useUsersQuery } from "@/hooks/admin/userManagingHooks.tsx/useAllUsers";
import { useStatusUpdateMutation } from "@/hooks/admin/userManagingHooks.tsx/useUpdateUserStatus";
import { useDebounce } from "../common/useDebounceHook/useDebounce";
import { DataTable } from "../common/tablecomponent/tableComponent";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { IUser } from "@/types/User";

const UserManagement = () => {
  const { 
    data, 
    isLoading, 
    currentPage,
    searchTerm,
    setSearchTerm,
    handlePagePrev,
    handlePageNext,
    handlePageSelect,
    refetch
  } = useUsersQuery();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      refetch();
    }
  }, [debouncedSearchTerm, refetch]);
  
  const { toggleStatusMutation } = useStatusUpdateMutation();
  const handleStatusUpdate = (userId: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ userId, currentStatus });
  };

  // Define columns for the DataTable - customized for UserManagement
  const columns = [
    { 
      header: "Name", 
      accessor: (user: IUser) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {user.Name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.Name}</span>
        </div>
      )
    },
    { 
      header: "Email", 
      accessor: (user: IUser) => (
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-muted-foreground" />
          {user.email}
        </div>
      )
    },
    { 
      header: "Phone", 
      accessor: (user: IUser) => (
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-muted-foreground" />
          {user.phoneNumber || "Not Available"}
        </div>
      )
    },
    { 
      header: "Status", 
      accessor: (user: IUser) => (
        <Badge
          variant={user.isActive ? "success" : "destructive"}
          className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
        >
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    { 
      header: "Action", 
      accessor: (user: IUser) => (
        <Button
          variant="outline"
          size="sm"
          className={user.isActive ? "text-red-500 border-red-200" : "text-green-500 border-green-200"}
          onClick={() => handleStatusUpdate(user._id, user.isActive)}
          disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.userId === user._id}
        >
          {toggleStatusMutation.isPending && toggleStatusMutation.variables?.userId === user._id ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : user.isActive ? (
            <X size={16} className="mr-2" />
          ) : (
            <Check size={16} className="mr-2" />
          )}
          {user.isActive ? "Deactivate" : "Activate"}
        </Button>
      )
    }
  ];

  // Custom empty state renderer with Framer Motion
  const customEmptyRenderer = () => (
    <div className="text-center py-12">
      <UserIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium">No users found</h3>
      <p className="text-muted-foreground">Try adjusting your search criteria</p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              className="relative mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-3 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10"
                />
                <Button 
                  onClick={() => refetch()} 
                  className="ml-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <DataTable
                data={data?.users || []}
                columns={columns}
                isLoading={isLoading && !data}
                emptyMessage=""
                emptyStateRenderer={customEmptyRenderer}
                currentPage={currentPage}
                totalPages={data?.totalPages || 1}
                onPagePrev={handlePagePrev}
                onPageNext={handlePageNext}
                onPageSelect={handlePageSelect}
                showPagination={(data?.users?.length || 0) > 0}
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserManagement;