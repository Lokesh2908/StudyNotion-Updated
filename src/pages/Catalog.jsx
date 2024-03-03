import React from 'react'
import Footer from '../components/common/Footer'
import { useParams } from 'react-router-dom'
import { useState } from 'react';
import { useEffect } from 'react';
import { apiConnector } from '../services/apiconnector';
import { categories } from '../services/apis';
import { getCatalogPageData } from '../services/operations/pageAndComponentData';
import { CourseSlider } from '../components/core/Catalog/CourseSlider';
import { Course_Card } from '../components/core/Catalog/Course_Card';
import { useSelector } from 'react-redux';
import {Error} from '../pages/Error';

export const Catalog = () => {
    const { loading } = useSelector((state) => state.profile)
    const [active, setActive] = useState(1);
    const {catalogName} = useParams();
    const [catalogPageData, setCatalogPageData] = useState(null);
    const [categoryId, setCategoryId] = useState("");

    //fetch all categories
    useEffect(()=> {
        const getCategories = async() => {
            const res = await apiConnector("GET", categories.CATEGORIES_API);
            const category_id = res?.data?.data.filter((ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName)[0]._id;
            setCategoryId(category_id);
        }
        getCategories();
    },[catalogName]);

    useEffect(() => {
        const getcategoryDetails = async() => {
            try{
                const res = await getCatalogPageData(categoryId);
                console.log("Printing res",res);
                setCatalogPageData(res);
            }catch(error){
                console.log(error)
            }
        }
        if(categoryId){
            getcategoryDetails();
        }
    },[categoryId]);

    if (loading || !catalogPageData) {
        return (
          <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
            <div className="spinner"></div>
          </div>
        )
      }
      if (!loading && !catalogPageData.success) {
        return <Error></Error>
      }

  return (
    <>
    <div className=" box-content bg-richblack-800 px-4">

        <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent">
            <p className="text-sm text-richblack-300">{`Home / Catalog /`}
            <span className="text-yellow-25">
                {catalogPageData?.data?.selectedCategory?.name}
            </span></p>
            <p className="text-3xl text-richblack-5">{catalogPageData?.data?.selectedCategory?.name}</p>
            <p className="max-w-[870px] text-richblack-200">{catalogPageData?.data?.selectedCategory?.description}</p>
        </div>

        <div>
            {/* section1 */}
            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading text-3xl text-richblack-5">Courses to get you started</div>
                 <div className="my-4 flex border-b border-b-richblack-600 text-sm">
                    <p
                    className={`px-4 py-2 ${
                        active === 1
                          ? "border-b border-b-yellow-25 text-yellow-25"
                          : "text-richblack-50"
                      } cursor-pointer`}
                      onClick={() => setActive(1)}
                    >
                        Most Popular
                    </p>
                    <p
                    className={`px-4 py-2 ${
                        active === 2
                          ? "border-b border-b-yellow-25 text-yellow-25"
                          : "text-richblack-50"
                      } cursor-pointer`}
                      onClick={() => setActive(2)}
                    >
                        New
                    </p>
                 </div>
                 <div>
                    {/* for the slider we have installed swiper */}
                    <CourseSlider Courses={catalogPageData?.data?.selectedCategory?.courses}></CourseSlider>         
                 </div>
            
            </div>
            
            {/* section2 */}
            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading text-3xl text-richblack-5">Top Courses in {catalogPageData?.data?.selectedCategory?.name}</div>
                <div className="py-8">
                    <CourseSlider Courses={catalogPageData?.data?.differentCategory?.courses}></CourseSlider>
                </div>
            </div>

            {/* section3 */}
            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading text-3xl text-richblack-5">Frequently Bought</div>
                <div className='py-8'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        {
                            catalogPageData?.data?.mostSellingCourses?.slice(0,4).map((course,index)=>(
                                <Course_Card course={course} key={index} height={"h-[400px]"}></Course_Card>
                            ))
                        }
                    </div>
                </div> 
            </div>
        </div>

        <Footer></Footer>

    </div>
    </>
  )
}
