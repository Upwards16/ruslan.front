import React from "react";
import {AuthService} from "../service/AuthService";

export default function MainPage() {
    const user = AuthService.GetUser()
    return (
        <div>
            <h1 className="text-[36px] font-bold mb-[52px]">
                {(!user.loading && !user.error) &&
                    `Добро пожаловать, ${user.result?.data.firstname} ${user.result?.data.lastname}!`
                }
            </h1>

        </div>
    );
}

