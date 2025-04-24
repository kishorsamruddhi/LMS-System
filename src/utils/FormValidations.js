const firstName = {
  required: "First Name is required",
  maxLength: {
    value: 15,
    message: "First Name cannot exceed 15 characters",
  },
  pattern: {
    value: /^[a-zA-Z]*$/,
    message: "First Name can only contain letters (uppercase and lowercase)",
  },
};

const lastName = {
  required: "Last Name is required",
  maxLength: {
    value: 15,
    message: "Last Name cannot exceed 15 characters",
  },
  pattern: {
    value: /^[a-zA-Z]*$/,
    message: "Last Name can only contain letters (uppercase and lowercase)",
  },
};

const email = {
  required: "Email is required",
  pattern: {
    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Please enter a valid email address",
  },
};

const businessName = {
  required: "Business Name is required",
};
const pinCode = {
  required: "Pin Code is required",
  maxLength: {
    value: 6,
    message: "Pin Code cannot exceed 6 characters",
  },
  pattern: {
    value: /^[0-9]*$/,
    message: "Pin Code can only contain numbers",
  },
};

const age = {
  required: "Age is required",
};

const Validations = {
  firstName,
  lastName,
  email,
  businessName,
  pinCode,
  age,
};

export default Validations;
