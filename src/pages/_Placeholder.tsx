export function Placeholder({
  title,
  comingIn,
}: {
  title: string;
  comingIn: string;
}) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-foreground mb-2">{title}</h1>
      <p className="text-sm text-mutedForeground">
        This section is coming in <span className="font-semibold text-foreground">{comingIn}</span>.
      </p>
    </div>
  );
}
