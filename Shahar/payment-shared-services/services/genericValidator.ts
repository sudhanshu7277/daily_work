import {
  validationRulesService,
  ValidationEffect,
  FieldValidationRule
} from './validationRulesService';

export { type ValidationEffect };

class GenericValidator {
  /**
   * Evaluates validation rules for a single field based on the current form state.
   */
  public evaluateField(fieldName: string, formValues: Record<string, any>): ValidationEffect | null {
    const rules: FieldValidationRule[] = validationRulesService.getFieldRules(fieldName);
    if (!rules || rules.length === 0) return null;

    // Sort rules by priority descending (highest priority evaluated first)
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      const conditionsMatch = rule.conditions.every(cond =>
        validationRulesService.evaluateCondition(cond, formValues)
      );

      if (conditionsMatch) {
        return { ...rule.effect };
      }
    }

    return null;
  }

  /**
   * Evaluates all registered fields against current form values.
   */
  public evaluateAllFields(formValues: Record<string, any>): Map<string, ValidationEffect> {
    const result = new Map<string, ValidationEffect>();
    const allFieldRules = validationRulesService.getRules().fields;

    for (const fieldName of Object.keys(allFieldRules)) {
      const effect = this.evaluateField(fieldName, formValues);
      if (effect) {
        result.set(fieldName, effect);
      }
    }

    return result;
  }

  /**
   * Evaluates cross-field cascading form rules.
   */
  public evaluateFormRules(formValues: Record<string, any>): Record<string, ValidationEffect> {
    const formRules = validationRulesService.getFormRules();
    const mergedEffects: Record<string, ValidationEffect> = {};

    for (const formRule of formRules) {
      const conditionsMatch = formRule.conditions.every(cond =>
        validationRulesService.evaluateCondition(cond, formValues)
      );

      if (conditionsMatch) {
        for (const [targetField, effect] of Object.entries(formRule.effects)) {
          mergedEffects[targetField] = {
            ...(mergedEffects[targetField] || {}),
            ...effect
          };
        }
      }
    }

    return mergedEffects;
  }

  /**
   * Merges cross-field form effects on top of individual field rules.
   */
  public applyToForm(
    fieldMap: Map<string, ValidationEffect>,
    formEffects: Record<string, ValidationEffect>
  ): Map<string, ValidationEffect> {
    const updatedMap = new Map<string, ValidationEffect>(fieldMap);

    for (const [fieldName, effect] of Object.entries(formEffects)) {
      const existing = updatedMap.get(fieldName) || {};
      updatedMap.set(fieldName, {
        ...existing,
        ...effect
      });
    }

    return updatedMap;
  }
}

export const genericValidator = new GenericValidator();
export default genericValidator;