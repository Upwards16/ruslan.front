import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  loading,
  className,
  onClick,
}): JSX.Element => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "outline-none text-[12px] py-[14px] px-[14px] bg-[#4E54E1] text-white rounded-[100px] w-[259px]",
        loading && "opacity-50 cursor-not-allowed",
        className && className
      )}
    >
      {children}
    </button>
  );
};
