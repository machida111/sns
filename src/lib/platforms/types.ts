export interface PublishInput {
  title: string | null;
  content: string;
  mediaUrl: string | null;
  credentials: Record<string, string>;
}

export interface PublishResult {
  externalId?: string;
  externalUrl?: string;
}

export interface PlatformAdapter {
  /** このプラットフォームの投稿に必要な credentials のキー一覧 (UIのヒント表示用) */
  requiredCredentialFields: { key: string; label: string; secret?: boolean }[];
  publish(input: PublishInput): Promise<PublishResult>;
}

export class PlatformPublishError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "PlatformPublishError";
  }
}
