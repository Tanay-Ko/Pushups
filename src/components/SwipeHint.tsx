interface SwipeHintProps {
  hints: string[]
}

export function SwipeHint({ hints }: SwipeHintProps) {
  return (
    <div className="flex flex-col items-center gap-1 mt-auto pt-8 pb-4">
      {hints.map((hint) => (
        <p key={hint} className="text-xs text-muted tracking-wide">
          {hint}
        </p>
      ))}
    </div>
  )
}
