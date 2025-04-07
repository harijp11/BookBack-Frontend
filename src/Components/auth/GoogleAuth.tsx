import React from "react";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  CredentialResponse,
} from "@react-oauth/google";

interface GoogleAuthProps {
  handleGoogleSuccess: (credentialResponse: CredentialResponse) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ handleGoogleSuccess }) => {
  const userId: string = import.meta.env.VITE_GOOGLE_CLIENT_ID
   console.log(userId)
  return (
    <GoogleOAuthProvider clientId={userId}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => {
          console.log("Login Failed");
        }}
        useOneTap
        type="standard"
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        logo_alignment="center"
        locale="en"
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;