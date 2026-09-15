import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { decryptJson } from "@/lib/crypto";
import { platformAdapters, PlatformPublishError } from "@/lib/platforms";

export async function publishPostById(postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId }, include: { account: true } });
  if (!post) throw new Error("Post not found");

  await prisma.post.update({ where: { id: post.id }, data: { status: PostStatus.PUBLISHING } });

  const adapter = platformAdapters[post.platform];
  const credentials = decryptJson<Record<string, string>>(post.account.credentials);

  try {
    const result = await adapter.publish({
      title: post.title,
      content: post.content,
      mediaUrl: post.mediaUrl,
      credentials,
    });

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        externalId: result.externalId ?? null,
        externalUrl: result.externalUrl ?? null,
        errorMessage: null,
      },
    });

    await prisma.postLog.create({
      data: { postId: post.id, status: PostStatus.PUBLISHED, message: result.externalUrl ?? "published" },
    });

    return updated;
  } catch (err) {
    const message = err instanceof PlatformPublishError ? err.message : `不明なエラー: ${String(err)}`;

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { status: PostStatus.FAILED, errorMessage: message },
    });

    await prisma.postLog.create({
      data: { postId: post.id, status: PostStatus.FAILED, message },
    });

    return updated;
  }
}

export async function publishDuePosts() {
  const due = await prisma.post.findMany({
    where: { status: PostStatus.SCHEDULED, scheduledAt: { lte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    take: 20,
  });

  const results = [];
  for (const post of due) {
    results.push(await publishPostById(post.id));
  }
  return results;
}
