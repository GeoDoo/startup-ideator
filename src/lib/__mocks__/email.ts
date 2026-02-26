import { vi } from "vitest";

export const sendEmail = vi.fn().mockResolvedValue(undefined);
export const invitationEmail = vi.fn().mockReturnValue({
  subject: "You've been invited",
  html: "<p>Join the team</p>",
});
