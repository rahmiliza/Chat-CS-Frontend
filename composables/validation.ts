export function useValidation<T extends Record<string, any>>(rules: Record<string, any>) {
  const errors = ref<Record<string, any>>({});

  const getRuleSet = (path: string[], ruleSet: any) => {
    return path.reduce((obj, key) => {
      if (!obj) return null;
      return obj[key] ?? null;
    }, ruleSet);
  };



  const setNestedError = (fieldPath: string[], errorMessage: string | null) => {
    let current = errors.value;
    for (let i = 0; i < fieldPath.length - 1; i++) {
      if (!current[fieldPath[i]]) current[fieldPath[i]] = {};
      current = current[fieldPath[i]];
    }
    const lastKey = fieldPath[fieldPath.length - 1];

    if (errorMessage) {
      current[lastKey] = errorMessage;
    } else {
      delete current[lastKey];
    }
  };

  const validateField = (path: string[], value: any) => {
    const ruleSet = getRuleSet(path, rules);
    console.log(ruleSet);
    if (typeof ruleSet === "function") {
      setNestedError(path, ruleSet(value));
    } else if (typeof ruleSet === "object") {
      for (const key in ruleSet) {
        validateField([...path, key], value?.[key]);
      }
    }
  };

  const validateAll = (formData: T) => {
    errors.value = {};
    let valid = true;

    const deepValidate = (data: any, ruleSet: any, path: string[] = []) => {
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          deepValidate(item, ruleSet, [...path, index.toString()]);
        });
      } else {
        for (const key in ruleSet) {
          if (typeof ruleSet[key] === "function") {
            const error = ruleSet[key](data?.[key]) || null;
            setNestedError([...path, key], error);
            if (error) valid = false;
          } else if (typeof ruleSet[key] === "object") {
            deepValidate(data?.[key], ruleSet[key], [...path, key]);
          }
        }
      }
    };

    deepValidate(formData, rules);
    return valid;
  };

  return { errors, validateAll, validateField };
}
