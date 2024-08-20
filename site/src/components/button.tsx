import { Key, ReactNode } from "react";

interface FAIButtonProps {
  clickHandler: () => void;
  children: ReactNode;
  disabled?: boolean;
  height?: number;
  width?: number;
  style?: "primary" | "secondary";
  key?: number | Key
}

const FAIButton: React.FC<FAIButtonProps> = ({ clickHandler, children, disabled=false, height=3, width=4, style="primary", key }) => {
  const styles = {
    "primary": `py-${height} px-${width} rounded font-medium enabled:shadow duration-100 bg-blue-500 text-white enabled:hover:bg-blue-600 disabled:text-gray-500 disabled:bg-blue-300 disabled:cursor-default`,
    "secondary": `py-${height} px-${width} rounded font-medium enabled:border border-gray-300 duration-100 bg-white text-blue-600 enabled:hover:bg-gray-200 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-default`,
  }
  return (
    <div key={key}>
      <button
        disabled={disabled}
        className={styles[style]}
        onClick={clickHandler}
      >
        {children}
      </button>
    </div>
  )
}

export default FAIButton;