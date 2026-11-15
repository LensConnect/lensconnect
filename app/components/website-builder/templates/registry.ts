import EditorialTemplate from "./editorial";

export const templateRegistry = {
  editorial: EditorialTemplate,
} as const;

export type TemplateKey = keyof typeof templateRegistry;