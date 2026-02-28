export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'textarea';
    placeholder?: string;
    required?: boolean;
    optionsUrl?: string;
    options?: { label: string; value: any }[];
    gridClass?: string;
    decimal?: boolean;
  }
  
  export interface FormSection {
    title: string;
    fields: FormField[];
  }
  
 
  export interface DynamicFormConfig {
    saveUrl: string;
    updateUrl?: string;
    sections: FormSection[];
  }