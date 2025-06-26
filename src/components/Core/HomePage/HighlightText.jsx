import React from 'react'

export default function HighlightText({text}) {
  return (
    <span className='font-bold text-transparent bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] bg-clip-text '>{text}</span>
  )
}
