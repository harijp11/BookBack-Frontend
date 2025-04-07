// components/UserManagement.tsx
import  { useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserIcon, Mail, Phone, Check, X } from "lucide-react";
import { useUsersQuery } from "@/hooks/admin/userManagingHooks.tsx/useAllUsers";
import { useStatusUpdateMutation } from "@/hooks/admin/userManagingHooks.tsx/useUpdateUserStatus";
import { Pagination1 } from "@/Components/common/pagination/pagination1";
import { useDebounce } from "../common/useDebounceHook/useDebounce"; // Import the debounce hook

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
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
    // handleSearch,
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
                {/* Search button is now optional since search happens automatically with debounce */}
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
              {isLoading && !data ? (
                <div className="flex justify-center items-center p-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : !data?.users.length ? (
                <div className="text-center py-12">
                  <UserIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No users found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * Math.min(index, 5) }}
                        className="transition-colors"
                        style={{ display: 'table-row' }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {user.Name?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.Name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-muted-foreground" />
                            {user.phoneNumber || "Not Available"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "success" : "destructive"}
                            className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              )}
            </motion.div>
            {(data?.users?.length || 0) > 0 && (
              <div className="mt-6">
                <Pagination1
                  currentPage={currentPage}
                  totalPages={data?.totalPages || 1}
                  onPagePrev={handlePagePrev}
                  onPageNext={handlePageNext}
                  onPageSelect={handlePageSelect}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserManagement;