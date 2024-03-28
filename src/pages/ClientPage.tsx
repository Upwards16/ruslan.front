import React, {useEffect, useState} from "react";
import {ClientsService} from "../service/ClientsService";
import {TrafficSourceService} from "../service/TrafficSourcesService";
import {
    CheckForPositiveNumbers,
    CustomModal,
    CustomPageSizeInput,
    CustomTable,
    ValidateFormSubmitResponse,
    ValidatePhoneNumber
} from "../helpers/helpers";
import {FormControl, IconButton, InputLabel, MenuItem, Pagination, Select, TextField} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {ManagerService} from "../service/ManagerService";
import {useLocation, useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import moment from "moment";
import AddIcon from "@mui/icons-material/Add";
import {getCookie} from "typescript-cookie";
import {position} from "../https/axiosInstance";
import {accessRules} from "../components/MiddleWare";

const modalInitialValues = {
    open: false,
    values: {
        id: "",
        name: "",
        phone: "",
        email: "",
        birthday: null,
        traffic_source: "",
        manager: "",
    },
    validation: {
        error: {
            name: false,
            phone: false,
            email: false,
            birthday: false,
            traffic_source: false,
            manager: false,
        },
        message: {
            name: "",
            phone: "",
            email: "",
            birthday: "",
            traffic_source: "",
            manager: "",
        }
    },
    action: "add",
    requestIsSent: false,
};

const tableInitialValues = {
    rows: [],
    status: {
        loading: false,
        error: false,
        message: "",
    },
    filter: {
        traffic_source: '',
        search: '',
        manager: "",
        status: "",
        size: 20,
        page: 1,
        total_pages: 1,
    },
}

export function ClientPage() {
    const userPosition = typeof getCookie(position) !== 'undefined' ? getCookie(position) : ''
    const location = useLocation()
    const navigate = useNavigate()
    const [pageAccessRule] = useState(() => {
        let rule: any = {};
        for (const key in accessRules) {
            if (location.pathname.includes(key)) {
                rule = accessRules[key].find((position: any) => position.position === userPosition)
            }
        }
        return rule.privileges
    })

    const [modal, setModal] = useState<any>(modalInitialValues);

    const [table, setTable] = useState({
        ...tableInitialValues,
        columns: [
            {field: "id", headerName: "id", width: "120px", hide: true},
            {field: "name", headerName: "ФИО / Компания", width: "120px", hide: false},
            {field: "phone", headerName: "Номер", width: "120px", hide: false},
            {field: "email", headerName: "Почта", width: "120px", hide: false},
            {field: "birthday", headerName: "Дата рождения", width: "120px", hide: false},
            {
                field: "traffic_source",
                headerName: "Источник",
                width: "120px",
                hide: false,
                renderCell: (params: any) => params.traffic_source?.name
            },
            {
                field: "manager",
                headerName: "Менеджер",
                width: "120px",
                hide: false,
                renderCell: (params: any) => <p>
                    {params.manager?.firstname} {params.manager?.lastname}
                </p>
            },
            {
                field: "", headerName: "", width: "0px", hide: false,
                renderCell: (params: any) => (
                    <div className="flex gap-[20px]">
                        {pageAccessRule.edit &&
                            <IconButton onClick={() => {
                                getClient(params, 'edit')
                            }}>
                                <EditIcon/>
                            </IconButton>
                        }
                        {pageAccessRule.delete &&
                            <IconButton onClick={() => {
                                getClient(params, 'delete')
                            }}>
                                <DeleteIcon style={{color: 'red'}}/>
                            </IconButton>
                        }
                    </div>
                ),
            },
        ],
    });

    const tableList = ClientsService.GetClientList(table.filter);
    const trafficSourceList = TrafficSourceService.GetTrafficSourceList();
    const managerList = ManagerService.GetManager();

    const [isLoading, setIsLoading] = useState(false);

    const getClient = (params: any, action: string) => {
        setModal({
            ...modal,
            open: true,
            action: action,
            values: {
                ...modal.values,
                ...params,
                traffic_source: params.traffic_source?.id,
                manager: params.manager?.id,
                birthday: params.birthday ? dayjs(params.birthday) : null,
            },
        });
    }
    const handleSubmitModalForm = (e: any) => {
        e.preventDefault();

        //submit error check function
        const checkModalResponse = (responseData: any) => {
            ValidateFormSubmitResponse(responseData, modal.validation.error, modal.validation.message)
                .then((res: any) => {
                    setModal({
                        ...modal,
                        validation: {
                            ...modal.validation,
                            error: res.errors,
                            message: res.messages
                        }
                    })
                }).catch((err) => {
                console.log(err)
            })
        }

        const payload: any = modal.values;
        for (let key in payload) {
            if (key === 'birthday') {
                payload[key] = moment(payload[key]?.$d).format('YYYY-MM-DD');
            }
            if (payload[key] === '') {
                delete payload[key]
            }
        }
        switch (modal.action) {
            case "add":
                setIsLoading(true);
                ClientsService.CreateClient(payload)
                    .then(() => {
                        tableList.execute()
                        setModal(modalInitialValues);
                    }).catch((err) => {
                    checkModalResponse(err.response.data)
                }).finally(() => {
                    setIsLoading(false);
                });
                break;

            case "edit":
                setIsLoading(true);
                ClientsService.UpdateClient(payload)
                    .then(() => {
                        tableList.execute()
                        setModal(modalInitialValues);
                    }).catch((err) => {
                    checkModalResponse(err.response.data)
                }).finally(() => {
                    setIsLoading(false);
                });
                break;

            case "delete":
                setIsLoading(true);
                ClientsService.DeleteClient(payload.id)
                    .then(() => {
                        tableList.execute()
                        setModal(modalInitialValues);
                    }).catch((err) => {
                    checkModalResponse(err.response.data)
                }).finally(() => {
                    setIsLoading(false);
                });
                break;
        }
    };

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
                },
            }));
        }
    }, [tableList.loading, tableList.error, tableList.result?.data]);

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-[36px] font-bold">Клиенты</h1>
                {pageAccessRule.add &&
                    <IconButton onClick={() => {
                        setModal({
                            ...modal,
                            open: true,
                            values: modalInitialValues.values,
                            action: "add",
                        });
                    }} sx={{
                        padding: '14px',
                        backgroundColor: '#4E54E1',
                        "&:hover": {opacity: '0.8', backgroundColor: '#4E54E1'}
                    }}>
                        <AddIcon sx={{color: '#FFF'}}/>
                    </IconButton>
                }
            </div>

            <div className=" flex items-center justify-between mt-[42px]">
                <div className="flex items-center gap-[20px]">
                    <FormControl size={'small'}>
                        <InputLabel>Источник</InputLabel>
                        <Select
                            autoWidth={true}
                            style={{borderRadius: '50px', minWidth: '120px', backgroundColor: "white"}}
                            value={table.filter.traffic_source}
                            label="Источник"
                            onChange={(event) => {
                                setTable({
                                    ...table,
                                    filter: {
                                        ...table.filter,
                                        traffic_source: event.target.value,
                                    },
                                });
                            }}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {!trafficSourceList.loading && !trafficSourceList.error &&
                                trafficSourceList.result?.data.map((status: any, index: number) => (
                                    <MenuItem key={index} value={status.id}>{status.name}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                    <FormControl size={'small'}>
                        <InputLabel>Менеджер</InputLabel>
                        <Select
                            autoWidth={true}
                            style={{borderRadius: '50px', minWidth: '130px', backgroundColor: "white"}}
                            value={table.filter.manager}
                            label="Менеджер"
                            onChange={(event) => {
                                setTable({
                                    ...table,
                                    filter: {
                                        ...table.filter,
                                        manager: event.target.value,
                                    },
                                });
                            }}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {!managerList.loading && !managerList.error &&
                                managerList.result?.data.results.map((manager: any, index: number) => (
                                    <MenuItem key={index}
                                              value={manager.id}>{manager.firstname} {manager.lastname}</MenuItem>
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

            <CustomTable
                columns={table.columns}
                rows={table.rows}
                checkboxSelection={false}
                loading={table.status.loading}
                onRowDoubleClick={(params: any) => (navigate(`/clients/${params.id}`))}
                error={table.status.error}
                message={table.status.message}
                footer={
                    <div
                        className="bg-white flex justify-between items-center p-2.5 pt-[40px] pl-[30px] pb-[20px]">
                        <div className="flex justify-between items-center gap-4 w-full">
                            <CustomPageSizeInput
                                value={table.filter.size}
                                onChange={(e: any) => {
                                    setTable({
                                        ...table,
                                        filter: {
                                            ...table.filter,
                                            page: 1,
                                            size: CheckForPositiveNumbers(e.target.value),
                                        },
                                    });
                                }}
                            />

                            <Pagination
                                count={table.filter.total_pages}
                                page={table.filter.page}
                                onChange={(event, value) => {
                                    setTable({
                                        ...table,
                                        filter: {
                                            ...table.filter,
                                            page: value,
                                        },
                                    });
                                }}
                            />
                        </div>
                    </div>
                }
            />

            <CustomModal
                open={modal.open}
                onClose={() => {
                    setModal({...modal, open: false});
                }}
                children={
                    <div className="flex flex-col text-[#505050]">
                        <h1 className="text-[24px] font-bold text-center">
                            {modal.action === "add" && "Добавить клиента"}
                            {modal.action === "edit" && "Редактировать данные клиента"}
                            {modal.action === "delete" && "Удалить клиента"}
                        </h1>

                        <form onSubmit={handleSubmitModalForm} className="pt-[40px] w-full">
                            {modal.action !== "delete" ? (
                                <div className="grid grid-cols-2 gap-[24px] gap-x-[60px]">
                                    <TextField
                                        variant="outlined"
                                        label="ФИО / Компания"
                                        helperText={modal.validation.message.name}
                                        error={modal.validation.error.name}
                                        type="text"
                                        value={modal.values.name}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    name: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />

                                    <TextField
                                        variant="outlined"
                                        helperText={modal.validation.message.email}
                                        error={modal.validation.error.email}
                                        type="email"
                                        label="Почта"
                                        value={modal.values.email}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    email: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />
                                    <DatePicker
                                        label="Дата рождения"
                                        format={'YYYY-MM-DD'}
                                        slotProps={{
                                            textField: {
                                                InputProps: {
                                                    sx: {borderRadius: '50px', backgroundColor: 'white'},
                                                }
                                            },
                                        }}
                                        value={modal.values.birthday ? dayjs(modal.values.birthday) : null}
                                        onChange={(date) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    birthday: date ? date.format('YYYY-MM-DD') : null,
                                                },
                                            });
                                        }}
                                    />

                                    <TextField
                                        variant="outlined"
                                        helperText={modal.validation.message.phone}
                                        error={modal.validation.error.phone}
                                        type="text"
                                        label="Номер телефона"
                                        value={modal.values.phone}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    phone: ValidatePhoneNumber(event.target.value),
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />

                                    <FormControl>
                                        <InputLabel>Источник</InputLabel>
                                        <Select
                                            autoWidth={true}
                                            style={{borderRadius: '50px', minWidth: '120px', backgroundColor: "white"}}
                                            label="Источник"
                                            value={modal.values.traffic_source}
                                            onChange={(event: any) => {
                                                setModal({
                                                    ...modal,
                                                    values: {
                                                        ...modal.values,
                                                        traffic_source: event.target.value,
                                                    },
                                                });
                                            }}
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {!trafficSourceList.loading && !trafficSourceList.error &&
                                                trafficSourceList.result?.data.map((trafficSource: any, index: number) => (
                                                    <MenuItem key={index}
                                                              value={trafficSource.id}>{trafficSource.name}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <InputLabel>Менеджер</InputLabel>
                                        <Select
                                            autoWidth={true}
                                            style={{borderRadius: '50px', minWidth: '120px', backgroundColor: "white"}}
                                            label="Менеджер"
                                            value={modal.values.manager}
                                            onChange={(event: any) => {
                                                setModal({
                                                    ...modal,
                                                    values: {
                                                        ...modal.values,
                                                        manager: event.target.value,
                                                    },
                                                });
                                            }}
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {!managerList.loading && !managerList.error &&
                                                managerList.result?.data.results.map((manager: any, index: number) => (
                                                    <MenuItem key={index}
                                                              value={manager.id}>{manager.firstname} {manager.lastname}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                </div>
                            ) : (
                                ""
                            )}

                            <div className="flex justify-center w-full mt-[50px]">

                                <button
                                    type="submit"
                                    className={`outline-none text-[12px] py-[14px] px-[14px] bg-[#4E54E1] text-white rounded-[100px] w-[259px] ${
                                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex justify-center">
                                            <div
                                                className="w-[19px] h-[19px] rounded-full animate-spin border-2 border-solid border-white border-t-transparent"
                                            ></div>
                                        </div>) : (
                                        <>
                                            {modal.action === "delete" && "Удалить"}
                                            {modal.action === "edit" && "Готово"}
                                            {modal.action === "add" && "Готово"}
                                        </>
                                    )}
                                </button>

                            </div>
                        </form>
                    </div>
                }
            />
        </>
    );
}

