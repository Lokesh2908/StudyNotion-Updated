import React, { useEffect, useRef, useState } from 'react'
import { Link, matchPath,useLocation} from 'react-router-dom'
import logo from "../../assets/Logo/Logo-Full-Light.png"
import {NavbarLinks} from "../../data/navbar-links";
import { useSelector } from 'react-redux';
import {AiOutlineShoppingCart, AiOutlineMenu} from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import  ProfileDropdown from "../core/Auth/ProfileDropdown"
import { apiConnector } from '../../services/apiconnector';
import { categories } from '../../services/apis';
import {ACCOUNT_TYPE} from "../../utils/constants"
import useOnClickOutside from "../../hooks/useOnClickOutside";

// const subLinks = [
//     {
//         title: "python",
//         link:"/catalog/python"
//     },
//     {
//         title:"web dev",
//         link:"/catalog/web-development"
//     },
// ];

export const Navbar = () => {

    const {token} = useSelector((state)=> state.auth);
    const {user} = useSelector((state)=> state.profile);
    const {totalItems} = useSelector((state)=> state.cart);
    const location = useLocation(); 
    const [open, setOpen] = useState(false);
    const [subLinks, setSubLinks] = useState([]);
    const [loading, setLoading] = useState(false)
    const ref = useRef(null);

    useOnClickOutside(ref, () => setOpen(false))

         const fetchSublinks =  async()=> {
            setLoading(true);
            try{
                const result = await apiConnector("GET",categories.CATEGORIES_API);
                console.log("Printing Sublinks result:", result);
                setSubLinks(result.data.data);
            }
            catch(error){
                console.log("Could not fetch the catalog list");
            }
            setLoading(false)
        }

    useEffect( () => {
        fetchSublinks();
    },[])

    const matchRoute = (route) => {
        return matchPath({path:route}, location.pathname);
    }

  return (
    <div className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== "/" ? "bg-richblack-800" : ""
      } transition-all duration-200`}>
        
        <div className='flex w-11/12 max-w-maxContent items-center justify-between'>
        {/* {logo} */}
        <Link to="/">
            <img src={logo} alt='Logo' width={160} height={32} loading='lazy'></img>
        </Link>

        <nav className='hidden md:block'>
            <ul className='flex gap-x-6 text-richblack-25'>
                {
                    NavbarLinks.map( (link,index) => (
                        
                        <li key={index}>
                            {
                                link.title === 'Catalog' ? (
                                <>    
                                <div className={`group relative flex cursor-pointer items-center gap-1 ${
                                    matchRoute("/catalog/:catalogName")
                                    ? "text-yellow-25"
                                    : "text-richblack-25"
                                }`}>
                                    <p>{link.title}</p>   
                                    <BsChevronDown /> 
                                    <div className='invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]'>
                                    
                                    <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5">
                                    </div>
                                    {loading ? (
                                        <p className='text-center'>Loading...</p>
                                    ) : subLinks.length ? (
                                            <>
                                              { subLinks?.filter((subLink) => subLink?.courses?.length > 0
                                              )  
                                              ?.map( (subLink, index)=> (
                                                    <Link to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`} key={index}
                                                    className='rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50'
                                                    >
                                                        <p>{subLink.name}</p>
                                                    </Link>
                                                ))}
                                            </>
                                        ) : (
                                            <p className="text-center">No Courses Found</p>
                                        )
                                    }

                                    </div>
                                </div>
                                </>
                                ) : (
                                    <Link to={link?.path}>
                                        <p className={`${matchRoute(link?.path)? "text-yellow-25" : "text-richblack-25"}`}>
                                            {link.title}
                                        </p>
                                    </Link>
                                )
                            }
                        </li>
                        
                    ))
                }         
            </ul>
        </nav>

        <div className='md:hidden block'>
        {
                    NavbarLinks.map( (link,index) => (
                        
                        <div key={index}>
                            {
                                link.title === 'Catalog' && (    
                                    <>    
                                    <div className={`group relative flex cursor-pointer items-center gap-1 ${
                                        matchRoute(link?.path)
                                        ? "text-yellow-25"
                                        : "text-richblack-25"
                                    }`}>
                                        <p>{link.title}</p>   
                                        <BsChevronDown /> 
                                        <div className='invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]'>
                                        
                                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5">
                                        </div>
                                        {loading ? (
                                            <p className='text-center'>Loading...</p>
                                        ) : subLinks.length ? (
                                                <>
                                                  { subLinks?.filter((subLink) => subLink?.courses?.length > 0
                                                  )  
                                                  ?.map( (subLink, index)=> (
                                                        <Link to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`} key={index}
                                                        className='rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50'
                                                        >
                                                            <p>{subLink.name}</p>
                                                        </Link>
                                                    ))}
                                                </>
                                            ) : (
                                                <p className="text-center">No Courses Found</p>
                                            )
                                        }
    
                                        </div>
                                    </div>
                                    </>
                                )
                            }
                        </div>
                        
                    ))
                }
        </div>

        {/* Login/Signup/Dashboard */}
        <div className="hidden items-center gap-x-4 md:flex">

            {
                user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (

                    <Link to="/dashboard/cart" className='relative'>
                        <AiOutlineShoppingCart className="text-2xl text-richblack-100"></AiOutlineShoppingCart>
                        {
                            totalItems>0 && (
                                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                                    {totalItems}
                                </span>
                            )
                        }
                    </Link>
                )
            }       
            {
                token === null && (
                    <Link to="/login">
                    <button className='rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100'>
                        Log in
                    </button>
                    </Link>
                )
            }
            {
                token === null && (
                    <Link to="/signup">
                        <button className='rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100'>
                            Sign Up
                        </button>
                    </Link>
                )
            }
            {
                token !== null && <ProfileDropdown></ProfileDropdown>
            }
        </div>
        <div className='flex gap-x-3 md:hidden'>
            {
                token !== null && <ProfileDropdown></ProfileDropdown>
            }

            <button className='mr-4 relative' onClick={() => setOpen(true)}>
                <AiOutlineMenu fontSize={24} fill="#AFB2BF"></AiOutlineMenu>
            {open && (
                <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-[118%] right-0 z-[1000] divide-y-[1px] divide-richblack-700 overflow-hidden rounded-md border-[1px] border-richblack-700 bg-richblack-800"
                ref={ref}
                >
                    {
                    NavbarLinks.map( (link,index) => (
                        
                        <div key={index}>
                            {
                                link.title != 'Catalog' && (    
                                <Link to={link?.path}>
                                    <p className={`${matchRoute(link?.path)? "text-yellow-25" : "w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25"}`}>
                                        {link.title}
                                    </p>
                                </Link>
                                )
                            }
                        </div>
                        
                    ))
                }
                {
                token === null && (
                    <Link to="/login">
                    <button className='w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25'>
                        Log in
                    </button>
                    </Link>
                )
            }
            {
                token === null && (
                    <Link to="/signup">
                        <button className='w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25'>
                            Sign Up
                        </button>
                    </Link>
                )
            }
                </div>)
            }
            </button>
        </div> 
        </div>
    </div>
  )
}
