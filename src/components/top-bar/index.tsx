export const TopBar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-15 p-3 bg-white w-full flex justify-between gap-2 border-b dark:bg-transparent dark:border-stone-900">
      {children}
    </div>
  );
};
