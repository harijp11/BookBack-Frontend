import * as Yup from 'yup';

export const DealTypeSchema = Yup.object().shape({
  name: Yup.string()
    .required('Deal type name is required')
    .min(2, 'Deal type name must be at least 2 characters')
    .max(50, 'Deal type name must be less than 50 characters'),
  description: Yup.string()
    .max(200, 'Description must be less than 200 characters')
});