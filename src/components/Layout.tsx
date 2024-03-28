import React from "react";
import {Outlet} from "react-router";
import Header from "./Header";
import {motion as m} from "framer-motion";

const Layout = () => {
    return (
        <m.section
            className="w-full min-h-screen pr-[58px] pt-[110px] pb-[55px] pl-[150px] text-[#282828] relative"
            initial={{scale: 0.9}}
            animate={{scale: 1}}
            transition={{duration: 0.3, ease: "easeOut"}}>
            <Header/>
            <Outlet/>
        </m.section>
    );
};

export default Layout;