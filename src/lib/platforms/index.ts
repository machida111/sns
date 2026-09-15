import { Platform } from "@prisma/client";
import { PlatformAdapter } from "./types";
import { xAdapter } from "./x";
import { instagramAdapter } from "./instagram";
import { noteAdapter } from "./note";

export const platformAdapters: Record<Platform, PlatformAdapter> = {
  X: xAdapter,
  INSTAGRAM: instagramAdapter,
  NOTE: noteAdapter,
};

export * from "./types";
