interface AuthDividerProps {
  text?: string;
}

export default function AuthDivider({
  text = "or continue with email",
}: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>

      <div className="relative flex justify-center">
        <span className="bg-card px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {text}
        </span>
      </div>
    </div>
  );
}