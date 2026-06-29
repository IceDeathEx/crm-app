export function Table({ children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }) {
  return (
    <thead className="bg-zinc-50 text-xs font-medium uppercase text-zinc-500">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children }) {
  return <th className="px-4 py-3">{children}</th>;
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-zinc-100">{children}</tbody>;
}

export function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 text-zinc-700 ${className}`}>{children}</td>;
}

export function EmptyState({ children }) {
  return (
    <div className="px-4 py-10 text-center text-sm text-zinc-500">
      {children}
    </div>
  );
}
