interface Props {
  currentStep: number;
  totalSteps: number;
}

export default function HotelStepper({ currentStep, totalSteps }: Props) {
  return (
    <div className="mx-auto mb-8 w-full max-w-5xl px-4 sm:px-6">
      <div className="mb-2 flex items-center justify-between text-xs font-medium sm:text-sm">
        <span>
          Step {currentStep} of {totalSteps}
        </span>

        <span className="shrink-0">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-muted sm:h-3">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
