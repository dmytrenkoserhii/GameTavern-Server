export const AUTH_VALIDATIONS = {
  password: {
    minLength: 8,
    maxLength: 32,
    /*
      - /(?=.*\d)|(?=.*\W+)/: Requires at least one digit or special character.
      - /(?![.\n])/: Prohibits passwords consisting solely of a dot or newline.
      - /(?=.*[A-Z])/: Ensures the presence of uppercase letters.
      - /(?=.*[a-z])/: Ensures the presence of lowercase letters.
    */
    matches: /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
  },
  username: {
    minLength: 3,
    maxLength: 32,
  },
};
