import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import {Bar, Line} from "react-chartjs-2";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import {AnalyticsService} from "../service/AnalyticsService";
import {TextField} from "@mui/material";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function AnalyticsPage() {
    const [cash, setCash] = useState<any>({
        data: {
            labels: [],
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top' as const,
                    },
                    title: {
                        display: true,
                        text: 'График',
                    },
                },
            },
            datasets: [
                {
                    id: 'income',
                    label: 'Приход',
                    data: [],
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgb(53, 162, 235)',
                },
                {
                    id: 'expense',
                    label: 'Расход',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgb(255, 99, 132)',
                },
            ],
        },
        filter: {
            start_date: dayjs(new Date()).subtract(1, 'year').format('YYYY-MM-DD'),
            end_date: dayjs(new Date()).format('YYYY-MM-DD'),
        }
    });

    const cashData = AnalyticsService.GetCash(cash.filter)

    useEffect(() => {
        if(!cashData.loading && !cashData.error){
            const data = cashData.result?.data
            setCash((prevState: any)=>{
                return {
                    ...prevState,
                    data: {
                        ...prevState.data,
                        datasets: prevState.data.datasets.map((set: any)=>{
                            return set.id === 'income' ? {
                                ...set,
                                data: data.list_of_income_count,
                            } : {
                                ...set,
                                data: data.list_of_expense_amount,
                            }
                        })
                    }
                }
            })
        }
    }, [cashData.loading, cashData.error, cashData.result?.data]);

    useEffect(() => {
        if (cash.filter.start_date && cash.filter.end_date) {
            const start = dayjs(cash.filter.start_date);
            const end = dayjs(cash.filter.end_date);
            const labels: any = [];
            let current = start;

            while (current.isBefore(end) || current.isSame(end, 'month')) {
                labels.push(current.format('MMM YYYY'));
                current = current.add(1, 'month');
            }

            setCash((prevCash: any) => ({
                ...prevCash,
                data: {
                    ...prevCash.data,
                    labels: labels,
                },
            }));
        }
    }, [cash.filter.start_date, cash.filter.end_date]);


    const [projects, setProjects] = useState<any>({
        data: {
            labels: [],
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top' as const,
                    },
                    title: {
                        display: true,
                        text: 'График',
                    },
                },
                scales: {
                    // to remove the y-axis labels
                    y: {
                        ticks: {
                            display: true,
                            beginAtZero: true,
                            stepSize: 2,
                        },
                        // to remove the y-axis grid
                        // grid: {
                        //     drawBorder: false,
                        //     display: false,
                        // },
                    },
                },
            },
            datasets: [],
        },
        filter: {
            start_date: dayjs(new Date()).subtract(1, 'year').format('YYYY-MM-DD'),
            end_date: dayjs(new Date()).format('YYYY-MM-DD'),
        }
    });

    const projectsData = AnalyticsService.GetProjects(projects.filter)

    useEffect(() => {
        if(!projectsData.loading && !projectsData.error){
            const data = projectsData.result?.data
            setProjects((prevState: any)=>{
                return {
                    ...prevState,
                    data: {
                        ...prevState.data,
                        datasets: data.charts.map((chart: any)=> ({
                            id: chart.slug,
                            label: chart.name,
                            data: chart.data,
                            borderColor: chart.color,
                            backgroundColor: chart.color,
                        }))
                    }
                }
            })
        }
    }, [projectsData.loading, projectsData.error, projectsData.result?.data]);

    useEffect(() => {
        if (projects.filter.start_date && projects.filter.end_date) {
            const start = dayjs(projects.filter.start_date);
            const end = dayjs(projects.filter.end_date);
            const labels: any = [];
            let current = start;

            while (current.isBefore(end) || current.isSame(end, 'month')) {
                labels.push(current.format('MMM YYYY'));
                current = current.add(1, 'month');
            }

            setProjects((prevState: any) => ({
                ...prevState,
                data: {
                    ...prevState.data,
                    labels: labels,
                },
            }));
        }
    }, [projects.filter.start_date, projects.filter.end_date]);

    return (
        <div>
            <h1 className="text-[36px] font-bold mb-[52px]">Главная</h1>
            <div className='w-full flex flex-col gap-[20px]'>
                <div className='flex justify-between items-start gap-[30px] rounded-[10px] bg-white drop-shadow-lg p-[20px]'>
                    <div className='flex flex-col gap-[40px] w-[157px] overflow-visible'>
                        <h4 className='text-[20px] font-[600] whitespace-nowrap'>Приходы и расходы</h4>
                        <div className='w-fit flex flex-col justify-start items-center gap-[20px]'>
                            <TextField
                                size='small'
                                type='date'
                                variant="outlined"
                                placeholder='Начало даты'
                                value={cash.filter.start_date}
                                onChange={(e) => {
                                    setCash({
                                        ...cash,
                                        filter: {
                                            ...cash.filter,
                                            start_date: e.target.value,
                                        },
                                    });
                                }}
                            />

                            <TextField
                                size='small'
                                type='date'
                                variant="outlined"
                                placeholder='Конец даты'
                                value={cash.filter.end_date}
                                onChange={(e) => {
                                    setCash({
                                        ...cash,
                                        filter: {
                                            ...cash.filter,
                                            end_date: e.target.value,
                                        },
                                    });
                                }}
                            />

                        </div>
                    </div>
                    <div className='w-full h-[476px]'>
                        <Line options={cash.data.options} data={cash.data} />
                    </div>
                </div>

                <div className='flex justify-between items-start gap-[30px] rounded-[10px] bg-white drop-shadow-lg p-[20px]'>
                    <div className=' flex flex-col gap-[40px] w-[157px] overflow-visible'>
                        <h4 className='text-[20px] font-[600] whitespace-nowrap'>Проекты</h4>
                        <div className='w-fit flex flex-col justify-start items-center gap-[20px]'>
                            <TextField
                                size='small'
                                type='date'
                                variant="outlined"
                                placeholder='Начало даты'
                                value={projects.filter.start_date}
                                onChange={(e) => {
                                    setProjects({
                                        ...projects,
                                        filter: {
                                            ...projects.filter,
                                            start_date: e.target.value,
                                        },
                                    });
                                }}
                            />

                            <TextField
                                size='small'
                                type='date'
                                variant="outlined"
                                placeholder='Конец даты'
                                value={projects.filter.end_date}
                                onChange={(e) => {
                                    setProjects({
                                        ...projects,
                                        filter: {
                                            ...projects.filter,
                                            end_date: e.target.value,
                                        },
                                    });
                                }}
                            />

                        </div>
                    </div>
                    <div className='w-full h-[476px]'>
                        <Bar options={projects.data.options} data={projects.data} />
                    </div>
                </div>
            </div>
        </div>
    );
}
