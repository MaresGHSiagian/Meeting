export interface AuthUser {
  id: string
  name: string
  email: string
  password: string
  initials: string
}

const USERS_KEY = "users"

export function getUsers(): AuthUser[] {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

export function addUser(user: AuthUser): void {
  if (typeof window === "undefined") return
  const users = getUsers()
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserByEmail(email: string): AuthUser | undefined {
  return getUsers().find((u) => u.email === email)
}
