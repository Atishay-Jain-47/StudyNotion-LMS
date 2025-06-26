import React from 'react'
import { Link } from 'react-router-dom'

export default function CTAButton({children, active, linkto}) {
  return (
    <Link to={linkto} className = {`px-6 py-3 flex justify-center items-center hover:shadow-none hover:scale-95 transition-all duration-200  font-bold bg-richblack-800 text-richblack-5 leading-[24px] text-[16px] text-center rounded-[8px] ${active ? "bg-[#FFD60A] text-richblack-900 " : ""} `}>
        {children}
    </Link>
  )
}
