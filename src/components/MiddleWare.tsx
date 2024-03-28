import React from "react";
import {getCookie} from "typescript-cookie";
import {access_token_name, position, refresh_token_name} from "../https/axiosInstance";
import {Navigate, useLocation} from "react-router-dom";

//admin - Администратор
//sales-manager - Менеджер по продажам
//ux-ui - UX/Ui
//backend - Backend
//frontend - Frontend
//tester - Тестировщик
//upwork-manager - Менеджер по upwork
//project-manager - Project Manager

export const accessRules: any = {
    "/home": [
        {
            position: 'admin',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'sales-manager',
            privileges: {
                add: true,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'project-manager',
            privileges: {
                add: true,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'frontend',
            privileges: {
                add: true,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'backend',
            privileges: {
                add: true,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'ux-ui',
            privileges: {
                add: true,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'tester',
            privileges: {
                add: true,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'upwork-manager',
            privileges: {
                add: true,
                edit: false,
                delete: false,
            }
        }
    ],
    "/clients": [
        {
            position: 'admin',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'sales-manager',
            privileges: {
                add: true,
                edit: true,
                delete: false,
            }
        },
        {
            position: 'project-manager',
            privileges: {
                add: false,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'upwork-manager',
            privileges: {
                add: true,
                edit: false,
                delete: false,
            }
        }
    ],
    "/employees": [
        {
            position: 'admin',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        }
    ],
    "/projects": [
        {
            position: 'admin',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'sales-manager',
            privileges: {
                add: false,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'project-manager',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'frontend',
            privileges: {
                add: false,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'backend',
            privileges: {
                add: false,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'ux-ui',
            privileges: {
                add: false,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'tester',
            privileges: {
                add: false,
                edit: false,
                delete: false,
            }
        },
        {
            position: 'upwork-manager',
            privileges: {
                add: true,
                edit: true,
                delete: false,
            }
        }
    ],
    "/incomes": [
        {
            position: 'admin',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        }
    ],
    "/expenses": [
        {
            position: 'admin',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        }
    ],
    "/leads": [
        {
            position: 'admin',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'sales-manager',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'upwork-manager',
            privileges: {
                add: false,
                edit: false,
                delete: false,
            }
        }
    ],
    "/tasks": [
        {
            position: 'admin',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'project-manager',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'frontend',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'backend',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'ux-ui',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'tester',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        }
    ],
    "/timeSheets": [
        {
            position: 'admin',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'project-manager',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'frontend',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'backend',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'ux-ui',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        },
        {
            position: 'tester',
            privileges: {
                add: true,
                edit: true,
                delete: true,
            }
        }
    ]
};


const MiddleWare = ({children}: any) => {
    const location = useLocation();
    const access_token = getCookie(access_token_name);
    const refresh_token = getCookie(refresh_token_name);
    const userPosition = getCookie(position);

    const isLoggedIn = access_token && refresh_token && userPosition;
    const isOnLoginPage = location.pathname.includes('login');

    if (isLoggedIn) {
        if (isOnLoginPage) {
            return <Navigate to="/home" replace/>; // Redirect logged-in users on the login page to the home page.
        }

        // Iterate over the keys (page names) in accessRules.
        for (const pageName in accessRules) {
            if (location.pathname.includes(pageName)) {
                const allowedRoles = accessRules[pageName];
                if (allowedRoles.some((role: any)=>role.position.includes(userPosition))) {
                    return children; // Allow access to the page.
                } else {
                    return <Navigate to="/denied-permission" replace/>;
                }
            }
        }

        // If there is no match in accessRules, allow access.
        return children;
    }

    if (!isLoggedIn && !isOnLoginPage) {
        return <Navigate to="/login" replace/>;
    }

    return children;
};

export default MiddleWare;
