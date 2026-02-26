import { vi } from "vitest";

export const redirect = vi.fn(() => {
  throw new Error("NEXT_REDIRECT");
});
export const notFound = vi.fn();
export const useRouter = vi.fn();
export const usePathname = vi.fn();
