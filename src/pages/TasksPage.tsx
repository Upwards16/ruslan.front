import React, {lazy, useEffect, useState} from "react";
import {ProjectsService} from "../service/ProjectsService";
import {Link} from "react-router-dom";
import {FormControl, InputLabel, MenuItem, Select, Skeleton, TextField} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const tableInitialValues = {
    rows: [],
    status: {
        loading: false,
        error: false,
        message: "",
    },
    filter: {
        search: "",
        client: "",
        status: "",
        size: 10,
        count: 0,
        page: 1,
        total_pages: 1,
    },
}
export default function TasksPage() {
    const [table, setTable] = useState({
        ...tableInitialValues,
        columns: []
    });
    const tableList = ProjectsService.GetProjectList(table.filter)
    const statusList = ProjectsService.GetProjectStatuses();
    const clientList = ProjectsService.GetProjectClients();

    useEffect(() => {
        if (tableList.loading) {
            setTable((prevState) => ({
                ...prevState,
                status: {
                    ...prevState.status,
                    loading: true,
                },
            }));
        } else if (tableList.error) {
            setTable((prevState) => ({
                ...prevState,
                status: {
                    ...prevState.status,
                    loading: false,
                    error: true,
                },
            }));
        } else {
            const data = tableList.result?.data
            setTable((prevState) => ({
                ...prevState,
                rows: data.results,
                status: {
                    ...prevState.status,
                    loading: false,
                    error: false,
                },
                filter: {
                    ...prevState.filter,
                    page: data.current_page,
                    total_pages: data.total_pages,
                    count: data.count,
                },
            }));
        }
    }, [tableList.loading, tableList.error, tableList.result?.data]);
    return (
        <>
            <h1 className="text-[36px] font-bold mb-[63px]">Задачи</h1>

            <div className="flex items-center justify-between my-[42px]">
                <div className="flex items-center gap-[20px]">
                    <FormControl size={'small'}>
                        <InputLabel>Статус</InputLabel>
                        <Select
                            autoWidth={true}
                            style={{borderRadius: '50px', minWidth: '120px', backgroundColor: "white"}}
                            value={table.filter.status}
                            label="Статус"
                            onChange={(event) => {
                                setTable({
                                    ...table,
                                    filter: {
                                        ...table.filter,
                                        status: event.target.value,
                                    },
                                });
                            }}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {!statusList.loading && !statusList.error &&
                                statusList.result?.data.map((status: any, index: number) => (
                                    <MenuItem key={index} value={status.id}>{status.name}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                    <FormControl size={'small'}>
                        <InputLabel>Клиент</InputLabel>
                        <Select
                            autoWidth={true}
                            style={{borderRadius: '50px', minWidth: '120px', backgroundColor: "white"}}
                            value={table.filter.client}
                            label="Клиент"
                            onChange={(event) => {
                                setTable({
                                    ...table,
                                    filter: {
                                        ...table.filter,
                                        client: event.target.value,
                                    },
                                });
                            }}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {!clientList.loading && !clientList.error &&
                                clientList.result?.data.map((status: any, index: number) => (
                                    <MenuItem key={index} value={status.id}>{status.name}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </div>

                <TextField
                    size='small'
                    variant="outlined"
                    placeholder='Поиск'
                    value={table.filter.search}
                    onChange={(e) => {
                        setTable({
                            ...table,
                            filter: {
                                ...table.filter,
                                search: e.target.value,
                            },
                        });
                    }}
                    InputProps={{
                        startAdornment: <SearchIcon/>,
                        sx: {borderRadius: '50px', backgroundColor: 'white'}
                    }}
                />
            </div>

            {
                table.status.loading && table.rows.length === 0
                    ?
                    <div className='w-full grid grid-cols-4 gap-[20px]'>
                        <Skeleton variant="rectangular" width={'100%'} height={140}/>
                        <Skeleton variant="rectangular" width={'100%'} height={140}/>
                        <Skeleton variant="rectangular" width={'100%'} height={140}/>
                        <Skeleton variant="rectangular" width={'100%'} height={140}/>
                        <Skeleton variant="rectangular" width={'100%'} height={140}/>
                        <Skeleton variant="rectangular" width={'100%'} height={140}/>
                        <Skeleton variant="rectangular" width={'100%'} height={140}/>
                        <Skeleton variant="rectangular" width={'100%'} height={140}/>
                        <Skeleton variant="rectangular" width={'100%'} height={140}/>
                        <Skeleton variant="rectangular" width={'100%'} height={140}/>
                    </div>
                    : table.status.error
                        ? 'error'
                        :
                        <div className='w-full grid grid-cols-4 gap-[20px] '>
                            {
                                table.rows.map((item: any, index: number) => (
                                    <Link to={`/tasks/${item.id}`} key={index}
                                        // className={`relative transition w-full h-[140px] bg-black/40 text-white overflow-hidden rounded-[10px] drop-shadow-lg bg-center hover:text-black bg-cover before:z-40 before:absolute before:-left-[100%] hover:before:left-0 before:transition-[left]  before:duration-[0.5s] before:top-0 before:content-[''] before:rounded-[10px] before:w-full before:h-full before:bg-black before:opacity-70`}
                                          className={`task-card relative w-full h-[140px] text-white overflow-hidden object-cover rounded-[10px] drop-shadow-lg bg-white`}
                                        // style={{backgroundImage: `url(${item.banner})`}}
                                    >
                                        <div
                                            className="w-full h-full absolute left-0 top-0 translate-x-[0%] bg-black/80 transition ease-in duration-200"></div>
                                        <img src={item.banner} alt={item.alt}/>
                                        <p className='absolute z-50 bottom-[20px] left-[20px] text-[22px] font-medium'>{item.name}</p>
                                    </Link>
                                ))
                            }
                            {table.filter.count > table.filter.size &&
                                <div
                                    className={`cursor-pointer flex items-end justify-start w-full h-[140px] p-[20px] bg-black opacity-60 hover:opacity-70 rounded-[10px] drop-shadow-lg bg-center text-white bg-cover`}
                                    onClick={() => {
                                        setTable({
                                            ...table,
                                            filter: {
                                                ...table.filter,
                                                size: table.filter.size + 10
                                            }
                                        })
                                    }}
                                >
                                    <p className='text-[20px] font-700'>Показать еще</p>
                                </div>
                            }
                        </div>
            }
        </>
    );
};

