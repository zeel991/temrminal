'use client';

const MonoLabel = ({label}: {label: string}) => {
  return <span className="rounded-xl bg-slate-200 px-2 py-1 font-mono text-black">{label}</span>;
};

export default MonoLabel;