export const getToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("jwt")
}

export const getUser = () => {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

export const logout = () => {
  localStorage.removeItem("jwt")
  localStorage.removeItem("user")
  window.location.href = "/login"
}