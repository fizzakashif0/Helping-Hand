<<<<<<< HEAD
import clsx from "clsx";
import React from "react";
=======
import React from "react";
import clsx from "clsx";
>>>>>>> 5538bb4c6b447a597a5a96cb18d8888f1556697e

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        className
      )}
    >
      {children}
    </span>
  );
}
<<<<<<< HEAD

export default Badge;
=======
>>>>>>> 5538bb4c6b447a597a5a96cb18d8888f1556697e
