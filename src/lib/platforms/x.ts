import { TwitterApi } from "twitter-api-v2";
import { PlatformAdapter, PlatformPublishError, PublishInput, PublishResult } from "./types";

// X (Twitter) API v2 でのテキスト投稿。OAuth1.0aのユーザーコンテキスト認証を使用する。
// 開発者ポータル (developer.twitter.com) でAppを作成し、
// Consumer Keys と Access Token & Secret (Read and Write権限) を取得して設定してください。
export const xAdapter: PlatformAdapter = {
  requiredCredentialFields: [
    { key: "appKey", label: "API Key (Consumer Key)" },
    { key: "appSecret", label: "API Secret (Consumer Secret)", secret: true },
    { key: "accessToken", label: "Access Token" },
    { key: "accessSecret", label: "Access Token Secret", secret: true },
  ],

  async publish(input: PublishInput): Promise<PublishResult> {
    const { appKey, appSecret, accessToken, accessSecret } = input.credentials;
    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      throw new PlatformPublishError("X: 認証情報(appKey/appSecret/accessToken/accessSecret)が不足しています");
    }

    const client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret });

    try {
      let mediaId: string | undefined;
      if (input.mediaUrl) {
        const res = await fetch(input.mediaUrl);
        if (!res.ok) {
          throw new PlatformPublishError(`X: メディア画像の取得に失敗しました (${res.status})`);
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get("content-type") || "image/jpeg";
        mediaId = await client.v1.uploadMedia(buffer, { mimeType: contentType });
      }

      const tweet = await client.v2.tweet({
        text: input.content,
        ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
      });

      return {
        externalId: tweet.data.id,
        externalUrl: `https://x.com/i/web/status/${tweet.data.id}`,
      };
    } catch (err) {
      if (err instanceof PlatformPublishError) throw err;
      throw new PlatformPublishError("X: 投稿に失敗しました", err);
    }
  },
};
