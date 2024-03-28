import React, {useState} from "react";
import logoImg from "../assets/images/logo.svg";
import circleImg from "../assets/images/info-circle.svg";
import {motion as m} from "framer-motion";
import {AuthService} from "../service/AuthService";
import jwtDecode from "jwt-decode";
import {setCookie} from "typescript-cookie";
import {access_token_name, position, refresh_token_name} from "../https/axiosInstance";

export default function AuthorizationPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [requestIsSent, setRequestIsSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRequestIsSent(true);
        AuthService.GetToken(email, password)
            .then((response) => {
                setRequestIsSent(false);

                // Get the current time in seconds
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);

                const accessDecode: any = jwtDecode(response.data.access);
                const refreshDecode: any = jwtDecode(response.data.refresh);

                const accessExpirationInSeconds = accessDecode.exp;
                const refreshExpirationInSeconds = refreshDecode.exp;

                // Calculate the difference in seconds
                const accessDifferenceInSeconds = accessExpirationInSeconds - currentTimeInSeconds;
                const refreshDifferenceInSeconds = refreshExpirationInSeconds - currentTimeInSeconds;

                // Convert the difference in seconds to days
                const accessDifferenceInDays = Math.ceil(accessDifferenceInSeconds / (60 * 60 * 24));
                const refreshDifferenceInDays = Math.ceil(refreshDifferenceInSeconds / (60 * 60 * 24));

                setCookie(access_token_name, response.data.access, {expires: accessDifferenceInDays,});
                setCookie(refresh_token_name, response.data.refresh, {expires: refreshDifferenceInDays,});
                setCookie(position, response.data.user.position.slug, {expires: refreshDifferenceInDays,});
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            })
            .catch((error) => {
                setRequestIsSent(false);

                if (error.response.status === 401) {
                    setErrorMessage(error.response.data.detail);
                } else {
                    setErrorMessage("Произошла ошибка при попытке входа.");
                }
            })
    };

    return (
        <div className="w-[1440px] h-[100dvh] p-[60px] m-auto">
            <div>
                <img src={logoImg} alt="img"/>

                <m.div
                    className="w-full flex justify-center items-center"
                    initial={{scale: 0.9}}
                    animate={{scale: 1}}
                    transition={{duration: 0.3, ease: "easeOut"}}
                >
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white w-[459px] h-[478px] rounded-[40px] flex flex-col gap-5 py-[80px] px-[100px] mt-[70px]"
                    >
                        <h1 className="text-[#505050] text-[36px] font-bold mb-[50px]">
                            Авторизация
                        </h1>
                        <input
                            className="rounded-[100px] w-full bg-[#FAFAFA] text-[12px] py-[14px] px-[24px] outline-none"
                            type="text"
                            required={true}
                            placeholder="Почта"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="relative">
                            <input
                                className="rounded-[100px] w-full bg-[#FAFAFA] text-[12px] py-[14px] px-[24px] outline-none"
                                type={showPassword ? "text" : "password"}
                                placeholder="Пароль"
                                required={true}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            >
                {showPassword ? "😯" : "😑"}
              </span>

                            {errorMessage && (
                                <div className="flex items-center gap-2 absolute top-[120%] left-0">
                                    <img src={circleImg} alt="img"/>
                                    <span className="text-[#BF1A1F] text-[12px]">
                    {errorMessage}
                  </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={`text-white text-[12px] bg-[#4E54E1] rounded-[100px] py-[14px] w-full mt-[30px] ${requestIsSent ? "cursor-not-allowed opacity-50" : ""}}`}
                            disabled={requestIsSent}
                        >
                            {requestIsSent ? (
                                <div className="w-full flex justify-center items-center">
                                    <div
                                        className="w-[18px] h-[18px] rounded-full animate-spin
                        border-2 border-solid border-white border-t-transparent"
                                    ></div>
                                </div>
                            ) : (
                                "Войти"
                            )}
                        </button>
                    </form>
                </m.div>
            </div>
        </div>
    );
}

