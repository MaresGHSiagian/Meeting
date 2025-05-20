interface UserAvatarProps {
  name: string
  initials: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserAvatar({ name, initials, size = "md", className = "" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-12 h-12 text-xl",
    md: "w-20 h-20 text-4xl",
    lg: "w-36 h-36 text-7xl",
  }

  return (
    <div
      className={`
        rounded-full
        bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400
        flex items-center justify-center
        text-white font-black
        border-8 border-white/30
        shadow-[0_0_40px_10px_rgba(236,72,153,0.5)]
        backdrop-blur-md
        relative
        overflow-hidden
        ${sizeClasses[size]}
        ${className}
        animate-[pulse_2s_infinite]
      `}
      title={name}
      style={{
        boxShadow: "0 0 40px 10px rgba(236,72,153,0.5), 0 0 0 8px rgba(255,255,255,0.15)",
      }}
    >
      {/* Animated Glow Layer */}
      <div className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
        style={{
          boxShadow: "0 0 60px 20px #f472b6, 0 0 120px 40px #fbbf24",
          opacity: 0.5,
        }}
      />
      <span
        className="relative z-10"
        style={{
          textShadow: `
            0 0 12px #fff,
            0 0 32px #f472b6,
            0 0 64px #fbbf24,
            0 0 128px #fbbf24
          `,
          letterSpacing: "0.15em",
          fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
        }}
      >
        {initials}
      </span>
    </div>
  )
}
