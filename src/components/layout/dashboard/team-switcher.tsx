// src/components/layout/dashboard/team-switcher.tsx

export function TeamHeader({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="h-8 w-8 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name}
            className="h-8 w-8 object-cover rounded-lg"
          />
        ) : (
          <div className="h-8 w-8 bg-muted" />
        )}
      </div>

      <div className="flex flex-col leading-tight">
        <span className="font-medium text-sm truncate">{name}</span>
        <span className="text-xs text-muted-foreground">Yayasan Madinah Salam</span>
      </div>
    </div>
  );
}