import { useTemplateFieldsStore } from '@/stores/common/template-fields.store';

export const manageEditorMode = (designMode: boolean = false): any => {
  if (designMode) {
    return {
      countdown: { enabled: false },
      video: { enabled: false },
      form: { enabled: false },
      image: { enabled: false },
      button: { enabled: false },
      rows: { enabled: false },
      divider: { enabled: false },
      heading: { enabled: false },
      menu: { enabled: false },
      social: { enabled: false },
      text: { enabled: false },
      carousel: { enabled: false },
      html: { enabled: false },
    };
  } else {
    return {
      countdown: { enabled: true },
      video: { enabled: false },
      form: { enabled: false },
    };
  }
};

export const manageMergeTags = () => {
  const templateFields = useTemplateFieldsStore(
    (state) => state.templateFields
  );

  return templateFields.reduce(
    (acc, field) => {
      acc[field.field] = {
        name: field.field,
        value: `{{${field.field_id}}}`,
        sample: field.default_field_value,
      };
      return acc;
    },
    {} as Record<string, { name: string; value: string; sample: string }>
  );
};
