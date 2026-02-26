import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockReset } from "vitest-mock-extended";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { invitePartner, acceptInvitation, revokeInvitation } from "./invitations";

const mockedPrisma = vi.mocked(prisma, true);
const mockedAuth = vi.mocked(auth);
const mockedSendEmail = vi.mocked(sendEmail);

function formData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

describe("inviting a partner to a team", () => {
  beforeEach(() => {
    mockReset(mockedPrisma);
    mockedAuth.mockReset();
    mockedSendEmail.mockReset();
    mockedSendEmail.mockResolvedValue(undefined);
  });

  it("rejects the invite when the user is not logged in", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await invitePartner(formData({ email: "bob@example.com", teamId: "t1" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/logged in/i);
  });

  it("rejects the invite when the email is invalid", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1", email: "alice@x.com" } });

    const result = await invitePartner(formData({ email: "not-an-email", teamId: "t1" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/email/i);
  });

  it("prevents a non-creator from inviting", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1", email: "alice@x.com" } });
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1", role: "partner", joinedAt: new Date(),
    } as never);

    const result = await invitePartner(formData({ email: "bob@x.com", teamId: "t1" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/creator/i);
  });

  it("prevents inviting yourself", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1", email: "alice@x.com" } });
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1", role: "creator", joinedAt: new Date(),
    } as never);

    const result = await invitePartner(formData({ email: "alice@x.com", teamId: "t1" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/yourself/i);
  });

  it("prevents inviting someone who is already a member", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1", email: "alice@x.com" } });
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1", role: "creator", joinedAt: new Date(),
    } as never);
    mockedPrisma.teamMember.findFirst.mockResolvedValue({ id: "m2" } as never);

    const result = await invitePartner(formData({ email: "bob@x.com", teamId: "t1" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already/i);
  });

  it("enforces the 10-member team cap", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1", email: "alice@x.com" } });
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1", role: "creator", joinedAt: new Date(),
    } as never);
    mockedPrisma.teamMember.findFirst.mockResolvedValue(null);
    mockedPrisma.teamMember.count.mockResolvedValue(10);

    const result = await invitePartner(formData({ email: "bob@x.com", teamId: "t1" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/maximum/i);
  });

  it("succeeds and notifies the invitee via email", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1", email: "alice@x.com", name: "Alice" } });
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1", role: "creator", joinedAt: new Date(),
    } as never);
    mockedPrisma.teamMember.findFirst.mockResolvedValue(null);
    mockedPrisma.teamMember.count.mockResolvedValue(2);
    mockedPrisma.invitation.findFirst.mockResolvedValue(null);
    mockedPrisma.team.findUnique.mockResolvedValue({ id: "t1", name: "Acme" } as never);
    mockedPrisma.invitation.create.mockResolvedValue({
      id: "inv1", token: "tok123", email: "bob@x.com",
    } as never);

    const result = await invitePartner(formData({ email: "bob@x.com", teamId: "t1" }));
    expect(result.success).toBe(true);
    expect(mockedSendEmail).toHaveBeenCalled();
  });

  it("rejects inviting someone who already has a pending invite", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1", email: "alice@x.com", name: "Alice" } });
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1", role: "creator", joinedAt: new Date(),
    } as never);
    mockedPrisma.teamMember.findFirst.mockResolvedValue(null);
    mockedPrisma.teamMember.count.mockResolvedValue(2);
    mockedPrisma.invitation.findFirst.mockResolvedValue({ id: "existing-inv" } as never);

    const result = await invitePartner(formData({ email: "bob@x.com", teamId: "t1" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already/i);
  });
});

describe("accepting a team invitation", () => {
  beforeEach(() => {
    mockReset(mockedPrisma);
    mockedAuth.mockReset();
  });

  it("rejects when the user is not logged in", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await acceptInvitation("some-token");
    expect(result.success).toBe(false);
    expect(result.redirect).toMatch(/login/);
  });

  it("rejects an expired invitation", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u2" } });
    mockedPrisma.invitation.findUnique.mockResolvedValue({
      id: "inv1", token: "tok", status: "pending",
      teamId: "t1", expiresAt: new Date("2020-01-01"),
    } as never);

    const result = await acceptInvitation("tok");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/expired/i);
  });

  it("succeeds and redirects the user to the team page", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u2" } });
    mockedPrisma.invitation.findUnique.mockResolvedValue({
      id: "inv1", token: "tok", status: "pending",
      teamId: "t1", expiresAt: new Date("2099-01-01"),
      team: { id: "t1" },
    } as never);
    mockedPrisma.teamMember.findUnique.mockResolvedValue(null);
    mockedPrisma.teamMember.count.mockResolvedValue(2);
    mockedPrisma.$transaction.mockResolvedValue([{}, {}] as never);

    const result = await acceptInvitation("tok");
    expect(result.success).toBe(true);
    expect(result.redirect).toMatch(/teams\/t1/);
  });

  it("enforces team cap when accepting", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u2" } });
    mockedPrisma.invitation.findUnique.mockResolvedValue({
      id: "inv1", token: "tok", status: "pending",
      teamId: "t1", expiresAt: new Date("2099-01-01"),
      team: { id: "t1" },
    } as never);
    mockedPrisma.teamMember.findUnique.mockResolvedValue(null);
    mockedPrisma.teamMember.count.mockResolvedValue(10);

    const result = await acceptInvitation("tok");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/capacity/i);
  });
});

describe("revoking an invitation", () => {
  beforeEach(() => {
    mockReset(mockedPrisma);
    mockedAuth.mockReset();
  });

  it("only allows the team creator to revoke", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u2" } });
    mockedPrisma.invitation.findUnique.mockResolvedValue({
      id: "inv1",
      team: { members: [{ userId: "u1", role: "creator" }] },
    } as never);

    const result = await revokeInvitation("inv1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/creator/i);
  });

  it("succeeds when called by the team creator", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.invitation.findUnique.mockResolvedValue({
      id: "inv1",
      team: { members: [{ userId: "u1", role: "creator" }] },
    } as never);
    mockedPrisma.invitation.update.mockResolvedValue({} as never);

    const result = await revokeInvitation("inv1");
    expect(result.success).toBe(true);
  });

  it("rejects when the invitation does not exist", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.invitation.findUnique.mockResolvedValue(null);

    const result = await revokeInvitation("nonexistent");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });
});
