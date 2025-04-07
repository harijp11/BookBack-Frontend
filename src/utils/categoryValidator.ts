import * as Yup from "yup";

export const CategorySchema = Yup.object().shape({
  name: Yup.string()
    .trim() 
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot be longer than 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Category name can only contain letters and spaces"),
  
  description: Yup.string()
    .trim() 
    .required("Description is required")
    .min(10, "Description must be at least 10 characters long")
    .max(500, "Description cannot be longer than 500 characters")
    .matches(/^[A-Za-z\s,.]+$/, "Description can only contain letters, spaces, commas, and full stops")
    .test(
      "at-least-eight-letters",
      "Description must contain at least 8 letters",
      (value) => (value?.match(/[A-Za-z]/g) || []).length >= 8
    )
});
