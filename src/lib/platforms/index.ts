import { Platform } from "@prisma/client";
import { PlatformAdapter } from "./types";
import { xAdapter } from "./x";
import { noteAdapter } from "./note";

export const platformAdapters: Record<Platform, PlatformAdapter> = {
  X: xAdapter,
  NOTE: noteAdapter,
};

export * from "./types";
