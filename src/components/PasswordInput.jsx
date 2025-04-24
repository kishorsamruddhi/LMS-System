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
const PasswordInput = ({ register, errors }) => {
  const [showPassword, setShowPassword] = useState(false);

  function toggleEye() {
    setShowPassword(pre => !pre)
  }
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input {...register("password", passwordValidation)}
        id="password"
        type={showPassword ? "text" : "password"} />

      {showPassword ? <Eye onClick={toggleEye} /> : <EyeOff onClick={toggleEye} />}
    </div>
  );
};
export default PasswordInput;
