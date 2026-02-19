export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden items-center justify-center">
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Gymplat
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Your personal AI coach for elite performance.
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
