export interface ErrorResponse extends Error {
  response: {
    data: {
      message: string;
    };
  };
}