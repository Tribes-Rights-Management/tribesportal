import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use 'internal' for compact portal forms, 'external' for marketing forms */
  variant?: 'internal' | 'external';
}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, variant = 'internal', ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        {/* INTERNAL FORM SPACING (LOCKED)
            - Internal forms: 5px label-to-input gap (compact, operational)
            - External forms: 6px gap (slightly more breathing room) */}
        <div 
          ref={ref} 
          className={cn(
            variant === 'internal' ? "space-y-[5px]" : "space-y-1.5",
            className
          )} 
          {...props} 
        />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /** Use 'internal' for compact portal forms, 'external' for marketing forms */
  variant?: 'internal' | 'external';
}

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  FormLabelProps
>(({ className, variant = 'internal', ...props }, ref) => {
  const { formItemId } = useFormField();

  // INTERNAL FORM LABELS (LOCKED)
  // - Internal: 13px, concise, factual, always visible
  // - External: 14px, slightly more relaxed
  // - No color change on error
  return (
    <Label 
      ref={ref} 
      className={cn(
        variant === 'internal' 
          ? "text-[13px] font-medium text-foreground leading-tight" 
          : "text-[14px] font-medium text-foreground",
        className
      )} 
      htmlFor={formItemId} 
      {...props} 
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    );
  },
);
FormControl.displayName = "FormControl";

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Use 'internal' for compact portal forms, 'external' for marketing forms */
  variant?: 'internal' | 'external';
}

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, variant = 'internal', ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    // INTERNAL FORM HELPER TEXT (LOCKED)
    // - Default: none (omit unless strictly necessary for clarity)
    // - Internal: 12px, low-contrast, factual, minimal
    // - External: 13px, slightly more readable
    return (
      <p 
        ref={ref} 
        id={formDescriptionId} 
        className={cn(
          variant === 'internal'
            ? "text-[12px] text-muted-foreground leading-snug mt-1"
            : "text-[13px] text-muted-foreground leading-snug",
          className
        )} 
        {...props} 
      />
    );
  },
);
FormDescription.displayName = "FormDescription";

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Use 'internal' for compact portal forms, 'external' for marketing forms */
  variant?: 'internal' | 'external';
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, variant = 'internal', ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    // INTERNAL FORM VALIDATION (LOCKED)
    // - Inline validation only
    // - Clear, specific error messages
    // - No modal alerts for validation errors
    // - Neutral dark gray text (not red/emotional)
    // - No icons, emojis, or visual noise
    return (
      <p 
        ref={ref} 
        id={formMessageId} 
        className={cn(
          variant === 'internal'
            ? "text-[12px] text-[#525252] leading-snug mt-1"
            : "text-[13px] text-[#525252] leading-snug mt-1.5",
          className
        )} 
        {...props}
      >
        {body}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
