import React, {useState, useEffect} from "react";
import logoImg from "../assets/images/logo.svg";
import profileCircleImg from "../assets/images/profile-circle.svg";
import {Link} from "react-router-dom";
import {Logout, position} from "../https/axiosInstance";
import HomeIcon from '@mui/icons-material/Home';
import HailIcon from '@mui/icons-material/Hail';
import StyleIcon from '@mui/icons-material/Style';
import Groups2Icon from '@mui/icons-material/Groups2';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import {ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {AuthService} from "../service/AuthService";
import {accessRules} from "./MiddleWare";
import {getCookie} from "typescript-cookie";

function generateMenuItems(userPosition: string) {

    const menuItems = [
        {
            path: "/home",
            label: "Home",
            icon: <HomeIcon/>,
        },
        {
            path: "/employees",
            label: "Employees",
            icon: <HailIcon/>,
        },
        {
            path: "/projects",
            label: "Projects",
            icon: <StyleIcon/>,
        },
        {
            path: "/clients",
            label: "Clients",
            icon: <Groups2Icon/>,
        },
        {
            path: "/incomes",
            label: "Incomes",
            icon: <CurrencyExchangeIcon/>,
        },
        {
            path: "/expenses",
            label: "Expenses",
            icon: <ShoppingCartCheckoutIcon/>,
        },
        {
            path: "/leads",
            label: "Leads",
            icon: <PersonSearchIcon/>,
        },
        {
            path: "/tasks",
            label: "Tasks",
            icon: <SplitscreenIcon/>,
        },
        {
            path: "/timeSheets",
            label: "Time Sheets",
            icon: <AccessTimeIcon/>,
        },
    ];
    const rules = accessRules

    return menuItems.filter((item: any) => Array.from(new Set(rules[item.path])).some((elem: any) => {
        return elem.position === userPosition
    }));
}

function Header() {
    const [open, isOpen] = useState(false);


    const onClickOpen = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
        isOpen(!open);
    };

    const user = AuthService.GetUser();
    const userPosition = getCookie(position);
    const menuItems = generateMenuItems(typeof userPosition !== 'undefined' ? userPosition : '');
    const [activeItem, setActiveItem] = useState<string | null>(menuItems[0].path);

    const [sideBar, setSideBar] = useState(false)
    return (
        <>
            <header className="px-[58px] h-[70px] flex items-center bg-white w-full z-[999] drop-shadow-lg"
                    style={{position: "fixed", top: 0, left: 0}}>
                <div className="w-full m-auto flex items-end justify-between">
                    <Link to="/home">
                        <img src={logoImg} alt="img"/>
                    </Link>

                    <div className="relative z-40">
                        <div
                            className="flex items-center gap-[10px] cursor-pointer"
                            onClick={onClickOpen}
                        >
                            <img src={profileCircleImg} alt="img"/>

                            <div className='flex flex-col items-start justify-start'>
                                <p className="font-semibold text-[16px] text-[#282828]">
                                    {(!user.loading && !user.error) &&
                                        `${user.result?.data.firstname} ${user.result?.data.lastname}`
                                    }
                                </p>
                                <p className="font-semibold text-[12px] text-[#282828]">
                                    {(!user.loading && !user.error) &&
                                        `${user.result?.data.position.name}`
                                    }
                                </p>
                            </div>
                        </div>

                        <div onClick={() => isOpen(false)}
                             className={`${open ? "fixed top-0 left-0 w-full h-[100dvh]" : ""} `}>
                        </div>

                        <div
                            className={`transition ease-out duration-300 ${open ? 'translate-y-[15px] scale-100' : 'translate-y-full scale-0'}`}>

                            <div className="bg-slate-200 w-full rounded-xl py-2 px-2 absolute top-[150%] right-0 z-[1]">
                                <div className="flex items-center gap-[5px] cursor-pointer mt-[10px]">
                                    <img
                                        className="w-[20px] h-[20px]"
                                        src={profileCircleImg}
                                        alt="img"
                                    />

                                    <p className="font-semibold text-[12px] text-[#2C2C2C]">
                                        {(!user.loading && !user.error) &&
                                            `${user.result?.data.firstname} ${user.result?.data.lastname}`
                                        }
                                    </p>
                                </div>

                                <div className="flex w-full justify-end mt-[20px] mb-[5px]">
                                    <button
                                        type="button"
                                        className="text-[12px] bg-[#4E54E1] text-white px-3 py-1 rounded-xl hover:underline"
                                        onClick={Logout}
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {open &&
                    <div
                        onClick={onClickOpen}
                        className={`w-full h-[100%] fixed top-0 left-0 block`}
                    >

                    </div>
                }
            </header>

            <div
                className={`z-[998] flex justify-center fixed top-0 left-0 h-full bg-white pt-[70px] pb-[60px] drop-shadow-lg `}

                onMouseOver={() => {
                    setSideBar(true)
                }}

                onMouseOut={() => {
                    setSideBar(false)
                }}
            >
                <div className="w-full flex flex-col gap-[45px] h-full overflow-y-scroll py-[20px]">
                    {menuItems.map((item) => (
                        <Link key={item.path} to={item.path} onClick={() => setActiveItem(item.path)}>
                            <ListItem disablePadding sx={{display: 'block'}}>
                                <ListItemButton
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: sideBar ? 'initial' : 'center',
                                        px: 2.5,
                                        gap: 3,
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            justifyContent: 'center',
                                            color: activeItem === item.path ? 'blue' : '',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {sideBar && <ListItemText primary={item.label}/>}
                                </ListItemButton>
                            </ListItem>

                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Header;
