"use client"

interface SocialLinksProps {
  twitter?: string
  telegram?: string
  website?: string
}

export const SocialLinks = ({ twitter, telegram, website }: SocialLinksProps) => {
  if (!twitter && !telegram && !website) return null

  return (
    <div className="flex gap-3 pt-2 border-t border-slate-800">
      {twitter && (
        <a
          href={twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors text-xs"
          title="Twitter"
        >
          <span className="text-sm">🐦</span>
          <span>Twitter</span>
        </a>
      )}
      {telegram && (
        <a
          href={telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors text-xs"
          title="Telegram"
        >
          <span className="text-sm">✈️</span>
          <span>Telegram</span>
        </a>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors text-xs"
          title="Website"
        >
          <span className="text-sm">🌐</span>
          <span>Website</span>
        </a>
      )}
    </div>
  )
}
