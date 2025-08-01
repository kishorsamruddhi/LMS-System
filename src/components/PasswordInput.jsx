import { useState } from "react";
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";

const passwordValidation = {
  required: "Password is required",
  pattern: {
    value: /^[A-Za-z\d!@#$%^&*()_+-=]{6,}$/,
    message: "Password must contain at least 6 characters, including letters (uppercase and lowercase), digits, and symbols like !@#$%^&*()_+-="
  },
  minLength: {
    value: 6,
    message: "Password must be at least 6 characters long",
  },
  maxLength: {
    value: 30,
    message: "Password length cannot exceed 30 characters",
  },
}
const PasswordInput = ({ id = "password", register, errors, registerKey = "password" }) => {
  const [showPassword, setShowPassword] = useState(false);

  function toggleEye() {
    setShowPassword(pre => !pre)
  }
  const eyeClass = "cursor-pointer text-neutral-400 h-8 rounded-md hover:text-neutral-800 hover:bg-neutral-300 px-[6px] w-8 mr-[1px]  absolute top-1/2 right-0 translate-y-[-50%] "
  const Icon =
    showPassword ? <Eye className={eyeClass} onClick={toggleEye} /> : <EyeOff className={eyeClass} onClick={toggleEye} />
  return (
    <div className=" relative w-full">
      <Input {...register(registerKey, passwordValidation)}
        id={id}
        className={"border-1  border-neutral-300"}
        type={showPassword ? "text" : "password"} />
      {Icon}
    </div>
  );
};
export default PasswordInput;
