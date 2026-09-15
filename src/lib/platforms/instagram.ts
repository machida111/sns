import { PlatformAdapter, PlatformPublishError, PublishInput, PublishResult } from "./types";

const GRAPH_API_VERSION = "v19.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// Instagram Graph API 経由の投稿。
// 前提: Instagramアカウントが「ビジネス/クリエイターアカウント」で、
// Facebookページに連携済みであること。Meta for Developersでアプリを作成し、
// instagram_content_publish 権限を持つ長期アクセストークンとIG User IDを取得してください。
// 画像必須(テキストのみの投稿はサポートされません)。
export const instagramAdapter: PlatformAdapter = {
  requiredCredentialFields: [
    { key: "igUserId", label: "Instagram Business Account ID" },
    { key: "accessToken", label: "長期アクセストークン (Page Access Token)", secret: true },
  ],

  async publish(input: PublishInput): Promise<PublishResult> {
    const { igUserId, accessToken } = input.credentials;
    if (!igUserId || !accessToken) {
      throw new PlatformPublishError("Instagram: 認証情報(igUserId/accessToken)が不足しています");
    }
    if (!input.mediaUrl) {
      throw new PlatformPublishError(
        "Instagram: 投稿には画像(mediaUrl)が必須です。テキストのみの投稿はサポートされていません。"
      );
    }

    try {
      const createRes = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: input.mediaUrl,
          caption: input.content,
          access_token: accessToken,
        }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok || !createJson.id) {
        throw new PlatformPublishError(
          `Instagram: メディア作成に失敗しました - ${createJson?.error?.message ?? createRes.statusText}`
        );
      }

      const publishRes = await fetch(`${GRAPH_BASE}/${igUserId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: createJson.id,
          access_token: accessToken,
        }),
      });
      const publishJson = await publishRes.json();
      if (!publishRes.ok || !publishJson.id) {
        throw new PlatformPublishError(
          `Instagram: 公開に失敗しました - ${publishJson?.error?.message ?? publishRes.statusText}`
        );
      }

      return {
        externalId: publishJson.id,
        externalUrl: `https://www.instagram.com/p/${publishJson.id}/`,
      };
    } catch (err) {
      if (err instanceof PlatformPublishError) throw err;
      throw new PlatformPublishError("Instagram: 投稿に失敗しました", err);
    }
  },
};
