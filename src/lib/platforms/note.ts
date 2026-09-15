import { PlatformAdapter, PlatformPublishError, PublishInput, PublishResult } from "./types";

const NOTE_API_BASE = "https://note.com/api/v1";

/**
 * ⚠️ 重要な注意事項 (必ずREADMEも参照してください)
 *
 * note.comには外部アプリ向けの公式投稿APIが提供されていません。
 * このアダプタは note.com にログインした状態のブラウザから取得できる
 * Cookie (認証情報) を使って、note内部で使われているエンドポイントに
 * リクエストを送る「非公式」な実装です。そのため:
 *   - note.com の仕様変更により予告なく動作しなくなる可能性があります
 *   - note.com利用規約に抵触しないか、利用者ご自身の責任でご確認ください
 *   - Cookieは第三者に漏れるとアカウントを乗っ取られるリスクがあるため、
 *     必ず暗号化された状態でのみ保存・利用してください(本アプリはDB保存時に暗号化しています)
 *
 * 動作しない場合は、生成された下書きをコピーしてnote.comの編集画面に
 * 手動で貼り付けて公開することを推奨します(管理画面から本文をコピーできます)。
 */
export const noteAdapter: PlatformAdapter = {
  requiredCredentialFields: [
    {
      key: "cookie",
      label: "note.com ログイン後のCookie文字列 (note_gql_auth_token を含む)",
      secret: true,
    },
  ],

  async publish(input: PublishInput): Promise<PublishResult> {
    const { cookie } = input.credentials;
    if (!cookie) {
      throw new PlatformPublishError("note: 認証情報(cookie)が不足しています");
    }

    const headers = {
      "Content-Type": "application/json",
      Cookie: cookie,
      "User-Agent": "Mozilla/5.0 (compatible; sns-note-automation-app)",
    };

    try {
      // 1. 下書きとして記事を作成
      const createRes = await fetch(`${NOTE_API_BASE}/text_notes`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: input.title || "無題の記事",
          body: input.content,
        }),
      });
      const createJson = await createRes.json().catch(() => null);
      const noteId = createJson?.data?.id ?? createJson?.id;
      if (!createRes.ok || !noteId) {
        throw new PlatformPublishError(
          `note: 下書き作成に失敗しました(非公式APIのため仕様変更の可能性があります) - ${createRes.status} ${JSON.stringify(
            createJson
          )}`
        );
      }

      // 2. 公開状態に更新
      const publishRes = await fetch(`${NOTE_API_BASE}/text_notes/${noteId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name: input.title || "無題の記事",
          body: input.content,
          status: "published",
        }),
      });
      const publishJson = await publishRes.json().catch(() => null);
      if (!publishRes.ok) {
        throw new PlatformPublishError(
          `note: 公開に失敗しました(下書きは作成済みです。note.comにログインして手動で公開してください) - ${publishRes.status} ${JSON.stringify(
            publishJson
          )}`
        );
      }

      const key = publishJson?.data?.key ?? publishJson?.key ?? noteId;
      return {
        externalId: String(noteId),
        externalUrl: `https://note.com/notes/${key}`,
      };
    } catch (err) {
      if (err instanceof PlatformPublishError) throw err;
      throw new PlatformPublishError(
        "note: 投稿に失敗しました(非公式APIのため、note.com側の仕様変更や認証切れの可能性があります)",
        err
      );
    }
  },
};
