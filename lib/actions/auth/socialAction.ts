import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";

export const socialAction = (action: string) => {
  signIn(action, { redirect: false }).then((callback) => {
    if (callback?.error) {
      toast.error("Invalid Credentials");
    }
  });
};
