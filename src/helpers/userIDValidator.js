export function userIDValidator(userID) {
  // const re = /\S+@\S+\.\S+/
  if (!userID) return "ID can't be empty."
  // if (!re.test(email)) return 'Ooops! We need a valid ID.'
  return ''
}
