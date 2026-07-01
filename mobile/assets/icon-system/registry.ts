import type { ComponentType } from "react";

import {
  AddIcon,
  ArrowLeftIcon,
  AiAnalysisIcon,
  CalendarIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  CloseIcon,
  DocumentIcon,
  DocumentUploadIcon,
  EditIcon,
  ErrorCircleIcon,
  EyeIcon,
  EyeOffIcon,
  FilterIcon,
  FrameIcon,
  GoogleIcon,
  RetryIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  StarIcon,
  TrashIcon,
} from "./icons";
import type { IconSvgProps } from "./types";

export const iconRegistry = {
  "arrow-right": SendIcon,
  "arrow-left": ArrowLeftIcon,
  add: AddIcon,
  "ai-analysis": AiAnalysisIcon,
  calendar: CalendarIcon,
  "chevron-down": ChevronDownIcon,
  "check-circle": CheckCircleIcon,
  close: CloseIcon,
  document: DocumentIcon,
  "document-upload": DocumentUploadIcon,
  edit: EditIcon,
  "error-circle": ErrorCircleIcon,
  eye: EyeIcon,
  "eye-off": EyeOffIcon,
  filter: FilterIcon,
  frame: FrameIcon,
  google: GoogleIcon,
  retry: RetryIcon,
  search: SearchIcon,
  send: SendIcon,
  settings: SettingsIcon,
  star: StarIcon,
  stop: FrameIcon,
  trash: TrashIcon,
} as const satisfies Record<string, ComponentType<IconSvgProps>>;

export type IconName = keyof typeof iconRegistry;

export const ICON_NAMES = Object.keys(iconRegistry) as IconName[];
