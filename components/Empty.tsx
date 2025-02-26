import Image from "next/image";
import React from "react";
interface EmptyProps {
  label: string;
}
export const Empty = ({ label }: EmptyProps) => {
  return (
    <div className="h-full p-20 flex flex-col items-center justify-center">
      <div className="relative h-72 w-72">
        <Image src="/logo.svg" alt="logo" fill />
        idar empty image lagana he for logo
      </div>
      <p className="text-muted-foreground text-sm text-center">{label}</p>
    </div>
  );
};
