export type CreationMode = "selection" | "create" | "upload" | "saved-templates";

export type BuilderTask = {
  id: string;
  label: string;
};

export type BuilderCategory = {
  id: string;
  label: string;
  subtasks: BuilderTask[];
};
