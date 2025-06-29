import React from 'react'
import CTAButton from './CTAButton'
import HighlightText from './HighlightText'
import { FaArrowRight } from 'react-icons/fa'
import { TypeAnimation } from 'react-type-animation'

export default function CodeBlocks({
    position, heading, subheading, ctabtn1, ctabtn2, codeblock, backgroundGradient, codeColor
}) {
  return (
    <div className={`flex ${position} my-20 justify-between gap-10 `}>

        {/* Section 1 */}
        <div className='flex flex-col w-[50%] gap-8 '>
            {heading}
            <div className='text-richblack-300 font-bold  '>
                {subheading}
            </div>

            <div className='flex gap-6 mt-7'>
                <CTAButton active={ctabtn1.active} linkto={ctabtn1.linkto}>
                    <div className='flex gap-2 items-center '>
                        {ctabtn1.btnText}
                        <FaArrowRight />
                    </div>
                </CTAButton>

                <CTAButton active={ctabtn2.active} linkto={ctabtn2.linkto}>
                    {ctabtn2.btnText}
                </CTAButton>

            </div>

        </div>


        {/* Section 2 */}
        <div className='h-fit code-border flex flex-row py-3 text-[10px] sm:text-sm leading-[18px] sm:leading-6 relative w-[100%] lg:w-[470px] '>
            
            {backgroundGradient}

            <div className='flex flex-col text-richblack-400 text-center w-[10%] font-bold font-inter '>
                <p>1</p>
                <p>2</p>
                <p>3</p>
                <p>4</p>
                <p>5</p>
                <p>6</p>
                <p>7</p>
                <p>8</p>
                <p>9</p>
                <p>10</p>
                <p>11</p>
            </div>

            <div className={`w-[90%] flex flex-col gap-2 ${codeColor} font-mono font-bold pr-2  `}>
                <TypeAnimation 
                    sequence={[codeblock, 2000, ""]}
                    repeat={Infinity}
                    cursor={true}
                    omitDeletionAnimation={true}
                    className='block whitespace-pre-line'
                />
            </div>
        </div>
      
    </div>
  )
}
