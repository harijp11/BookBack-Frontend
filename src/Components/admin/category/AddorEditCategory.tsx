import React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { useCategoryMutation } from "@/hooks/admin/categoryHooks/useAddorEditCategoryMutation";
import { Formik, Form } from "formik";
// Import the separated validation schema
import { CategorySchema } from "@/utils/categoryValidator"; // Adjust the path as needed

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: {
    _id: string;
    name: string;
    description?: string;
  } | null;
}

const AddorEditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  category
}) => {
  // Use the custom mutation hook
  const { mutate, isLoading } = useCategoryMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    }
  });

  // Initial form values
  const initialValues = {
    name: category?.name || "",
    description: category?.description || ""
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {category ? "Edit Category" : "Add New Category"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Formik
          initialValues={initialValues}
          validationSchema={CategorySchema}
          enableReinitialize={true}
          onSubmit={async (values) => {
            await mutate({
              id: category?._id,
              name: values.name,
              description: values.description
            });
          }}
        >
          {({ errors, touched, handleChange, values }) => (
            <Form className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Category Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Enter category name"
                    className={errors.name && touched.name ? "border-red-500" : ""}
                  />
                  {errors.name && touched.name && (
                    <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    placeholder="Enter category description (optional)"
                    rows={4}
                    className={errors.description && touched.description ? "border-red-500" : ""}
                  />
                  {errors.description && touched.description && (
                    <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {category ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddorEditCategoryModal;