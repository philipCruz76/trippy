"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, FC } from "react";
import ToasterContext from "./ToasterContext";

type ProvidersContextProps = {
  children: ReactNode;
};

const ProvidersContext: FC<ProvidersContextProps> = ({ children }) => {
  return (
    <SessionProvider>
      <ToasterContext />
      {children}
    </SessionProvider>
  );
};

export default ProvidersContext;
