"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getNotifications(limit = 20) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  });
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
}

export async function getNotificationPreferences() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { userId: session.user.id },
    });
  }

  return prefs;
}

export async function updateNotificationPreferences(
  data: Partial<{
    emailInvitations: boolean;
    emailAssessments: boolean;
    emailReports: boolean;
    emailPulseSurveys: boolean;
    emailDigest: boolean;
    inAppAll: boolean;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  });

  return { success: true };
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  link?: string
) {
  await prisma.notification.create({
    data: { userId, type, title, body, link },
  });
}
