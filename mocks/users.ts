import { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "1",
    email: "demo@aicheck.com",
    name: "Demo User",
    role: "free",
    subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 2,
    usageLimit: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "basic@aicheck.com",
    name: "Basic User",
    role: "basic",
    subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 12,
    usageLimit: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    email: "premium@aicheck.com",
    name: "Premium User",
    role: "premium",
    subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: 45,
    usageLimit: 200,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    email: "admin@aicheck.com",
    name: "Admin User",
    role: "admin",
    subscriptionEndsAt: null,
    usageCount: 0,
    usageLimit: Infinity,
    createdAt: new Date().toISOString(),
  },
];