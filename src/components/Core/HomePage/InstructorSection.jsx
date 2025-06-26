import React from "react";
import Instructor from "../../../assets/Images/Instructor.png";
import CTAButton from "./CTAButton";
import { FaArrowRight } from "react-icons/fa";
import HighlightText from "./HighlightText";

export default function InstructorSection() {
  return (
    <div className="font-inter">
      <div className="flex flex-col lg:flex-row gap-20 items-center justify-center">
        <div className="lg:w-[50%]">
          <img
            src={Instructor}
            alt="Instructor"
            className="shadow-white shadow-[-20px_-20px_0_0]"
          />
        </div>

        <div className="lg:w-[50%] flex gap-10 flex-col ">
          <div className=" lg:w-[50%]  text-4xl font-semibold">
            Become an
            <HighlightText text={" Instructor"} />
          </div>

          <div className="font-medium text-[16px] text-justify w-[90%] text-richblack-300">
            Instructors from around the world teach millions of students on
            StudyNotion. We provide the tools and skills to teach what you love.
          </div>

          <div className="w-fit">
            <CTAButton active={true} linkto={"/signup"}>
              <div className="flex items-center gap-3">
                Start Teaching Today
                <FaArrowRight />
              </div>
            </CTAButton>
          </div>

        </div>
      </div>
    </div>
  );
}
