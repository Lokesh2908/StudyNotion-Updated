import React from 'react'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom';
import RenderSteps from '../AddCourse/RenderSteps';
import { useEffect } from 'react';
import {  getFullDetailsOfCourse } from '../../../../services/operations/courseDetails';
import { setCourse, setEditCourse } from '../../../../slices/courseSlice';

export const EditCourse = () => {
    const dispatch = useDispatch();
    const {courseId} = useParams();
    const {course} = useSelector((state)=>state.course);
    const [loading,setLoading] = useState(false);
    const {token} = useSelector((state)=>state.auth);

    useEffect(()=> {
        console.log("--------",courseId);
        const populateCourseDetails = async ()=> {
            setLoading(true);
            const result = await getFullDetailsOfCourse(courseId,token);
            const newCourse = result?.courseDetails;
            console.log("result...",newCourse);
            if(newCourse){
                dispatch(setCourse(result?.courseDetails));
                dispatch(setEditCourse(true));
                console.log("course.....",course);
            }
            setLoading(false);
        }
        populateCourseDetails();
    },[])

    if(loading){
        return (
            <div>
                Loading...
            </div>
        )
    }

  return (
    <div>
        <h1>Edit Course</h1>
        <div>
            {
                course !==null ? (<RenderSteps></RenderSteps>) : (<p>Course Not Found</p>)
            }
        </div>
    </div>
  )
}
