import Anthropic from "@anthropic-ai/sdk";
import { Platform } from "@prisma/client";

export interface GenerateDraftInput {
  platform: Platform;
  topic: string;
  tone?: string;
}

export interface GenerateDraftOutput {
  title: string | null;
  content: string;
}

const PLATFORM_GUIDE: Record<Platform, string> = {
  NOTE: [
    "note.com向けの記事を作成してください。",
    "小見出し(##)を使い、1000〜1600文字程度の読みやすい記事にしてください。",
    "1行目に記事タイトルを 'TITLE: ' で始めて出力し、空行の後に本文をMarkdown形式で出力してください。",
  ].join("\n"),
  X: [
    "X(旧Twitter)向けの投稿文を作成してください。",
    "全角・半角合わせて120文字以内、簡潔で興味を引く内容にしてください。",
    "タイトルは不要です。投稿文のみを出力してください。ハッシュタグは最大2つまで。",
  ].join("\n"),
  INSTAGRAM: [
    "Instagram投稿のキャプションを作成してください。",
    "冒頭2行で惹きつける導入にし、絵文字を適度に使い、最後に関連ハッシュタグを5〜8個つけてください。",
    "タイトルは不要です。キャプション本文のみを出力してください。",
  ].join("\n"),
};

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

export async function generateDraft(input: GenerateDraftInput): Promise<GenerateDraftOutput> {
  const client = getClient();
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  const systemPrompt = [
    "あなたはSNS/noteの運用を担当するプロのコンテンツライターです。",
    "与えられたテーマをもとに、指定されたプラットフォーム向けの投稿下書きを日本語で作成します。",
    "誇大広告・虚偽情報・差別的表現は避け、自然で読みやすい文章にしてください。",
    PLATFORM_GUIDE[input.platform],
  ].join("\n\n");

  const userPrompt = [
    `テーマ: ${input.topic}`,
    input.tone ? `トーン/文体の希望: ${input.tone}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (input.platform === "NOTE") {
    const match = text.match(/^TITLE:\s*(.+)\n+([\s\S]*)$/);
    if (match) {
      return { title: match[1].trim(), content: match[2].trim() };
    }
  }

  return { title: null, content: text };
}
