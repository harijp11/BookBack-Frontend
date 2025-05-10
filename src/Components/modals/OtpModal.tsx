import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/Components/ui/input-otp";
import { useTimer } from "@/hooks/useTimer";
import { Loader2 } from "lucide-react";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  onResend: () => void;
  isSending: boolean;
}

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  onResend,
  isSending,
}) => {
  const [otp, setOtp] = React.useState("");
  const { timeLeft, startTimer, resetTimer } = useTimer(60);

  useEffect(() => {
    if (isOpen && !isSending) {
      setOtp("");
      resetTimer();
      startTimer();
    }
  }, [isOpen, resetTimer, startTimer, isSending]);

  const handleVerify = () => {
    onVerify(otp);
  };

  const handleResend = () => {
    setOtp("");
    // resetTimer();
    onResend();
    // startTimer();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter OTP</DialogTitle>
          <DialogDescription>
            Please enter the 4-digit code sent to your device.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isSending ? (
            <div className="flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Sending OTP...</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />   
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Time remaining: {timeLeft} seconds
            </p>
          </div>
          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={otp.length !== 4}
          >
            Verify OTP
          </Button>
          {!isSending && timeLeft === 0 && (
            <Button variant="outline" onClick={handleResend} className="w-full">
              Resend OTP
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;