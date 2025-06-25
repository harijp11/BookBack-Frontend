import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addUserNotifyForBook,
  BookResponse,
  IBook,
} from "@/services/book/bookService";
import { useToast } from "@/hooks/ui/toast";

export const useAddUserNotify = (userId: string) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => addUserNotifyForBook(bookId),
    onMutate: async (bookId: string) => {
      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ["book", bookId] });

      // Snapshot previous data
      const previousData = queryClient.getQueryData<{ book: IBook }>(["book", bookId]);

      queryClient.setQueryData(
        ["book", bookId],
        (oldData: { book: IBook } | undefined) => {
          if (!oldData || !oldData.book) return oldData;
          const notifyUsers = oldData.book.notifyUsers || [];
          const isUserNotified = notifyUsers.includes(userId);
          const newNotifyUsers = isUserNotified
            ? notifyUsers.filter((id) => id !== userId) // Remove user
            : [...notifyUsers, userId]; // Add user
          return {
            ...oldData,
            book: {
              ...oldData.book,
              notifyUsers: newNotifyUsers,
            },
          };
        }
      );

      return { previousData }; // Context for rollback
    },
    onSuccess: (data:Omit<BookResponse, "book">, bookId: string) => {

      // Update cache based on success flag
      queryClient.setQueryData(
        ["book", bookId],
        (oldData: { book: IBook } | undefined) => {
          if (!oldData || !oldData.book) return oldData;
          const notifyUsers = oldData.book.notifyUsers || [];
          const newNotifyUsers = data.success
            ? [...new Set([...notifyUsers, userId])] // Add user (deduplicated)
            : notifyUsers.filter((id) => id !== userId); // Remove user
          return {
            ...oldData,
            book: {
              ...oldData.book,
              notifyUsers: newNotifyUsers,
            },
          };
        }
      );

      // Show toast based on response
      if (data.success) {
        toast.success(data.message || "You will be notified when this book is available!");
      } else {
        toast.info(data.message || "You have been removed from the notify list");
      }
    },
    onError: (error: unknown, bookId: string, context?: { previousData: { book: IBook } | undefined}) => {
  if (context?.previousData) {
    queryClient.setQueryData(["book", bookId], context.previousData);
  }

  const err = error as { response?: { data?: { message?: string } } };
  console.error("Notification error:", err);
  toast.error(
    err?.response?.data?.message || "Failed to set notification. Please try again."
  );
},
    // No onSettled to avoid refetching
  });
};