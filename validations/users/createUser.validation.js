const createUser = {
  fullName: {
    notEmpty: true,
    errorMessage: "email cannot be empty",
  },
  email: {
    notEmpty: true,
    errorMessage: "email cannot be empty",
    isEmail: {
      errorMessage: "Invalid email address",
    },
  },
  password: {
    notEmpty: true,
    errorMessage: "password cannot be empty",
  },
  phone: {
    notEmpty: true,
    errorMessage: "phone cannot be empty",
  },
}

module.exports = { createUser }
