type UserRole = "donor" | "recipient" | "ngo" | null;

let userRole: UserRole = null;

type Subscriber = (role: UserRole) => void;
const subscribers: Subscriber[] = [];

export function getUserRole(): UserRole {
  return userRole;
}

export function setUserRole(role: UserRole) {
  userRole = role;
  subscribers.forEach(fn => fn(userRole));
}

export function subscribeToUserRole(fn: Subscriber): () => void {
  subscribers.push(fn);
  return () => {
    const idx = subscribers.indexOf(fn);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}
