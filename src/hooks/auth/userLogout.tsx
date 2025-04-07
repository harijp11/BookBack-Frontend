import { MutationFunction, useMutation } from "@tanstack/react-query";

export const useLogout = (mutationFunc: MutationFunction<unknown>) => {
  return useMutation<unknown, unknown, void>({
    mutationFn: mutationFunc,
  });
};
