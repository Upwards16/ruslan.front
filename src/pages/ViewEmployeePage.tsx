import React from "react";
import {useParams} from "react-router-dom";
import { Skeleton} from "@mui/material";
import {EmployeesService} from "../service/EmployeesService";
import {BarChart} from "@mui/x-charts";


export default function ViewClientPage() {
    const {id} = useParams()

    const employee = EmployeesService.GetEmployeeByAsyncHook(typeof id !== 'undefined' ? id : '')
    // const projects = ProjectsService.GetProjectByAsyncHook(typeof id !== 'undefined' ? id : '');

    return (
        <>
            <h1 className="text-[36px] font-bold mb-[63px]">Просмотр сотрудника</h1>

            {employee.loading
                ?
                <>
                    <Skeleton variant="rectangular" width={'100%'} height={360}/>

                    <div className='w-full flex gap-[24px] mt-[20px]'>
                        <Skeleton variant="rectangular" width={'30%'} height={360}/>
                        <Skeleton variant="rectangular" width={'70%'} height={360}/>
                    </div>
                </>
                : employee.error
                    ? 'error'
                    :
                    <div className='grid grid-cols-1 gap-[24px]'>
                        <div className="p-5 rounded-[10px] bg-white shadow-block">
                            <div className="flex flex-col gap-[20px] mb-[40px]">
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Фамилия Имя Отчество
                                    </p>
                                    <h2 className="text-[24px] font-bold">
                                        {employee.result?.data.firstname} {employee.result?.data.lastname}
                                    </h2>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Статус
                                    </p>
                                    <h2 className="text-[16px] font-bold text-[#31E764]">
                                        {employee.result?.data.status.name}
                                    </h2>
                                </div>
                            </div>


                            <div className="mt-[24px] flex justify-between mb-[40px]">
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Должность
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        {employee.result?.data.position.name}
                                    </h2>
                                </div>
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Дата рождения
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        {employee.result?.data.date_of_birth}
                                    </h2>
                                </div>
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Номер
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        <h2 className="text-[16px] text-[#505050] font-medium">
                                            {employee.result?.data.phone}
                                        </h2>
                                    </h2>
                                </div>
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Реквизиты
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        <h2 className="text-[16px] text-[#505050] font-medium">
                                            {employee.result?.data.bank_details}
                                        </h2>
                                    </h2>
                                </div>
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Резюме
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        <h2 className="text-[16px] text-[#505050] font-medium">
                                            <a href={employee.result?.data.cv} download>
                                                {employee.result?.data.cv}
                                            </a>
                                        </h2>
                                    </h2>
                                </div>
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Telegram
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        <h2 className="text-[16px] text-[#505050] font-medium w-[142px] overflow-x-auto">
                                            {employee.result?.data.telegram}
                                        </h2>
                                    </h2>
                                </div>
                            </div>


                            <div className="mt-[24px] flex justify-between">
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Linkedin
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        {employee.result?.data.linkedin}
                                    </h2>
                                </div>
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Github
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        {employee.result?.data.github}
                                    </h2>
                                </div>
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Заработная плата
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        <h2 className="text-[16px] text-[#505050] font-medium">
                                            {employee.result?.data.salary}
                                        </h2>
                                    </h2>
                                </div>
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Почта
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium w-[142px] overflow-x-auto">
                                        <h2 className="text-[16px] text-[#505050] font-medium ">
                                            {employee.result?.data.email}
                                        </h2>
                                    </h2>
                                </div>
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Дата найма
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        <h2 className="text-[16px] text-[#505050] font-medium">
                                            {employee.result?.data.date_start_work}
                                        </h2>
                                    </h2>
                                </div>
                                <div className="w-[142px]">
                                    <p className="text-[10px] font-medium text-[#8C8C8C] mb-2">
                                        Почасовая оплата
                                    </p>
                                    <h2 className="text-[14px] text-[#505050] font-medium">
                                        <h2 className="text-[16px] text-[#505050] font-medium">
                                            {employee.result?.data.hourly_payment_cost}
                                        </h2>
                                    </h2>
                                </div>
                            </div>
                        </div>


                        <div className="flex gap-[20px]">
                            <div
                                className="flex flex-col gap-[30px] w-[25%] bg-white shadow-block p-[31px] rounded-[10px]">
                                <div className="flex items-center justify-between text-[14px]">
                                    <h4 className="font-semibold">Проекты</h4>
                                    <h4 className="font-semibold">Статус</h4>
                                </div>

                                <div className="overflow-y-scroll h-[275px] space-y-[30px]">
                                    <div className="flex items-center justify-between text-[12px]">
                                        <h5>Agama</h5>
                                        <span
                                            className="font-bold text-[#31E764] bg-[#31E7641A] py-2 px-3 rounded-full">Выполнен</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[12px]">
                                        <h5>Agama</h5>
                                        <span
                                            className="font-bold text-[#31E764] bg-[#31E7641A] py-2 px-3 rounded-full">Выполнен</span>
                                    </div>

                                </div>


                            </div>

                            <div className="w-[75%] bg-white shadow-block p-[31px] rounded-[10px]">
                                <h4 className="font-semibold">Отработанное время</h4>

                                <BarChart
                                    xAxis={[
                                        {
                                            id: 'barCategories',
                                            data: ['bar A', 'bar B', 'bar C', 'bar D', 'bar E', 'bar F'],
                                            scaleType: 'band',
                                        },
                                    ]}
                                    series={[
                                        {
                                            data: [1, 2, 3, 4, 5, 6],
                                        },
                                    ]}
                                    height={300}
                                    className="w-full "
                                />

                            </div>
                        </div>
                    </div>
            }
        </>
    );
}

