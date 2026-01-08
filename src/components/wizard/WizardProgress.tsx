interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  if (currentStep === 0 || currentStep >= totalSteps - 1) return null;

  const progress = ((currentStep) / (totalSteps - 2)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Step {currentStep} of {totalSteps - 2}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
