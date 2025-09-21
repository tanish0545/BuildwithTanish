export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      <p className="ml-4 text-sm text-muted-foreground">Loading Home...</p>
    </div>
  );
}
