import { Wrench } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Wrench className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold tracking-tight">
        <span className="text-foreground">اطلب </span>
        <span className="text-primary">فني</span>
      </h1>
    </div>
  );
}
