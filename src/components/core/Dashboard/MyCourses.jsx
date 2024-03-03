import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { fetchInstructorCourses } from '../../../services/operations/courseDetails';
import { IconBtn } from '../../common/iconBtn';
import {AiOutlinePlus} from "react-icons/ai";
import {CoursesTable} from "./InstructorCourses/CoursesTable";

export const MyCourses = () => {

       const {token} = useSelector((state)=>state.auth);
       const navigate = useNavigate();
       const [courses, setCourses] = useState([]);

       useEffect(()=> {
        const fetchCourses = async () => {
            const result = await fetchInstructorCourses(token);
            console.log(result);
            if(result){
                setCourses(result);
            }
        }
        fetchCourses();
       },[])

  return (
    <div className='text-white'>
        <div className='flex justify-between'>
            <h1>My Courses</h1>
            <IconBtn text="Add Courses" onClick={()=> navigate("/dashboard/add-course")}>
                <AiOutlinePlus></AiOutlinePlus>
            </IconBtn>
        </div>
        {
            courses && <CoursesTable courses={courses} setCourses={setCourses}></CoursesTable>
        }
    </div>
  )
}
