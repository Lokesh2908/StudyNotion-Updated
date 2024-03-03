import React from 'react'
import { useForm } from 'react-hook-form'
import { IconBtn } from '../../../../common/iconBtn';
import { useState } from 'react';
import {MdNavigateNext} from "react-icons/md"
import {IoAddCircleOutline} from "react-icons/io5"
import {GrAddCircle} from "react-icons/gr"
import { useDispatch, useSelector } from 'react-redux';
import { BiRightArrow } from 'react-icons/bi';
import { setCourse, setEditCourse, setStep } from '../../../../../slices/courseSlice';
import { createSection, updateSection } from '../../../../../services/operations/courseDetails';
import { toast } from 'react-hot-toast';
import { NestedView } from './NestedView';

export const CourseBuilderForm = () => {

    const {register, handleSubmit, setValue, getValues, formState:{errors}} = useForm();
    const [editSectionName, setEditSectionName] = useState(null);
    const {course} = useSelector((state)=> state.course);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const {token} = useSelector((state)=> state.auth);

    const cancelEdit = () => {
        setEditSectionName(null);
        setValue("sectionName","");
    }

    const goBack = ()=> {
        dispatch(setStep(1));
        dispatch(setEditCourse(true));
    }

    const goToNext = () => {
        if(course.courseContent.length === 0){
            toast.error("Please add atleast one Section");
            return;
        }
        if(course.courseContent.some((section)=> section.subSection.length === 0)){
            toast.error("Please add atleast one lecture in each section");
            return;
        }
        //if everything is good
        dispatch(setStep(3));
    }

    const onSubmit = async (data) => {
        setLoading(true);
        let result;

        if(editSectionName){

            result = await updateSection({
                sectionName: data.sectionName,
                sectionId:editSectionName,
                courseId:course._id,
            },token)
 
        }
        else{
            result = await createSection({
                sectionName:data.sectionName,
                courseId:course._id
            },token)
        }
        //update values
        if(result){
            dispatch(setCourse(result));
            console.log("created or updated section name",result);
            setEditSectionName(null);
            setValue("sectionName","");
        }

        setLoading(false);
    }

    const handleChangeEditSectionName = (sectionId, sectionName) => {

        if(editSectionName === sectionId){
            cancelEdit();
            return;
        }

        setEditSectionName(sectionId);
        setValue("sectionName", "");
    }

  return (
    <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
        <p className='text-2xl font-semibold text-richblack-5'>Course Builder</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor='sectionName'>Section name<sup className="text-pink-200">*</sup></label>
                <input
                id='sectionName'
                disabled={loading}
                placeholder='Add a section to build your course'
                {...register("sectionName",{required:true})}
                className='form-style w-full'
                ></input>
                {errors.sectionName && (
                    <span>Section Name is required.</span>
                )}
                {errors.sectionName && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              Section name is required
            </span>
          )}
            </div>
            <div className='flex items-end gap-x-4'>
               <IconBtn
               type='Submit'
               disabled={loading}
               text={editSectionName ? "Edit Section Name" : "Create Section"}
               outline={true}
               customClasses={"text-white"}
               >
            <IoAddCircleOutline className='text-yellow-50' size={20}></IoAddCircleOutline>
               </IconBtn>
               {
                editSectionName && (
                    <button
                    type='button'
                    onClick={cancelEdit}
                    className='text-sm text-richblack-300 underline'
                    >Cancel Edit</button>
                )
               }  
            </div>
        </form>
        {/* .length > 0 */}
        {course.courseContent.length > 0 && (
            <NestedView handleChangeEditSectionName={handleChangeEditSectionName}></NestedView>
        )}       

        <div className='flex justify-end gap-x-3'>
            <button onClick={goBack} className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}>
                Back
            </button>
            <IconBtn
            text="Next"
            onClick={goToNext}
            >
            <MdNavigateNext></MdNavigateNext>
            </IconBtn>
        </div>   
    </div>
  )
}
