interface AuthHeadingProps {
  title: string;
  description: string;
}

export default function AuthHeading({
  title,
  description,
}: AuthHeadingProps) {
  return (
    <div className="mb-4 space-y-2 text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        {title}
      </h1>

      <p className="text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}