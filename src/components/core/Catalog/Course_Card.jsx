import React from 'react'
import RatingStars from '../../common/RatingStars';
import { useState } from 'react';
import { useEffect } from 'react';
import GetAvgrating from '../../../utils/avgRating'
import { Link } from 'react-router-dom';

export const Course_Card = ({course,Height}) => {

    const [avgReviewCount, setAvgReviewCount] = useState(0);

    useEffect(()=>{
        const count = GetAvgrating(course.ratingAndReviews);
        setAvgReviewCount(count); 
    },[course])

  return (
    <>
        <Link to={`/courses/${course._id}`}>
            <div>
                <div className='rounded-lg'>
                    <img src={course?.thumbnail} alt='course thumbnail'
                    className={`${Height} w-full rounded-xl object-cover`}
                    ></img>
                </div>
                <div className="flex flex-col gap-2 px-1 py-3">
                    <p className="text-xl text-richblack-5">{course?.courseName}</p>
                    <p className="text-sm text-richblack-50">{course?.instructor?.firstName} {course?.instructor?.lastName}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-5">{avgReviewCount || 0}</span>
                        <RatingStars Review_Count={avgReviewCount}></RatingStars>
                        <span className="text-richblack-400">{course?.ratingAndReviews?.length} Ratings</span>
                    </div>
                    <p className="text-xl text-richblack-5">₹ {course?.price}</p>
                </div>
            </div>
        </Link>
    </>
  )
}
