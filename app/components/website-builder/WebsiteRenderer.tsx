import type { ComponentType } from "react";

import { templateRegistry, type TemplateKey } from "./templates/registry";
import type { WebsiteTemplateProps } from "./templates/types";

type WebsiteRendererProps = {
  template: string;
  data: WebsiteTemplateProps;
};

export function WebsiteRenderer({ template, data }: WebsiteRendererProps) {
  const selectedTemplate =
    template in templateRegistry ? (template as TemplateKey) : null;

  if (!selectedTemplate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 text-center text-neutral-700">
        <div className="max-w-lg rounded-sm border border-neutral-200 bg-white p-10 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
            Template unavailable
          </p>
          <h2 className="mt-4 font-serif text-3xl text-neutral-900">
            This website template is not available.
          </h2>
        </div>
      </div>
    );
  }

  const TemplateComponent = templateRegistry[selectedTemplate] as ComponentType<WebsiteTemplateProps>;

  return <TemplateComponent {...data} />;
}
