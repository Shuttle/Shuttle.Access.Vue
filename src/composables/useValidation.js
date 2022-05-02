import useVuelidate from '@vuelidate/core';

export function useValidation(rules, state) {
    const v$ = useVuelidate(rules, state);
    
    const validate = (path) => {
        const error = v$.value.$errors.find(item => item.$propertyPath == path);
        
        if (!error) {
            return;
        }
    
        return {
            message: error.$message,
            variant: "danger",
            size: "sm",
            outline: true
        }
    }

    const errors = async () => {
        await v$.value.$validate();

        return v$.value.$errors;
    }

    return {
        v$: v$,
        validate: validate,
        errors: errors
    }
};