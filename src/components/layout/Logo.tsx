export function Logo() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="overflow-hidden rounded-3xl" style={{ maskImage: 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 85%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at center, black 40%, transparent 85%)' }}>
        <video
          src="/logos/glamouurs.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-sm:h-9 sm:h-28 w-auto object-contain"
        />
      </div>
    </div>
  )
}
