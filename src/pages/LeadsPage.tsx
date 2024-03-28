import React, {useEffect, useState} from "react";
import {
    CheckForPositiveNumbers,
    CustomModal,
    CustomPageSizeInput,
    CustomTable,
    ValidateFormSubmitResponse,
    ValidatePhoneNumber,
} from "../helpers/helpers";
import {FormControl, IconButton, InputLabel, MenuItem, Pagination, Select, TextField} from "@mui/material";
import {LeadsService} from "../service/LeadsServices";
import {TrafficSourceService} from "../service/TrafficSourcesService";
import {ManagerService} from "../service/ManagerService";
import {useLocation, useNavigate} from "react-router-dom";
import moment from "moment/moment";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {DateTimePicker} from "@mui/x-date-pickers";
import {getCookie} from "typescript-cookie";
import {position} from "../https/axiosInstance";
import {accessRules} from "../components/MiddleWare";

const modalInitialValues = {
    open: false,
    values: {
        id: "",
        full_name: "",
        reminder_date: null,
        traffic_source: "",
        phone: "",
        date: null,
        comment: "",
        status: "",
        user: "",
    },
    validation: {
        error: {
            full_name: "",
            reminder_date: '',
            traffic_source: "",
            phone: "",
            date: "",
            comment: "",
            status: "",
            user: "",
        },
        message: {
            full_name: "",
            reminder_date: '',
            traffic_source: "",
            phone: "",
            date: "",
            comment: "",
            status: "",
            user: "",
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
        start_date: "",
        end_date: "",
        status: "",
        size: 20,
        page: 1,
        total_pages: 1,
    },
}

export default function LeadsPage() {
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
            {
                field: "full_name",
                headerName: "ФИО / Компания",
                width: "120px",
                hide: false,

            },
            {
                field: "phone",
                headerName: "Номер",
                width: "120px",
                hide: false,
            },
            {
                field: "date",
                headerName: "Дата",
                width: "120px",
                hide: false,
            },
            {
                field: "reminder_date",
                headerName: "Напоминание",
                width: "120px",
                hide: false,
                renderCell: (params: any) => params.reminder_date !== null ? moment(params.reminder_date).format('DD.MM.YYYY hh:mm') : ''
            },
            {
                field: "status",
                headerName: "Статус",
                width: "120px",
                hide: false,
                renderCell: (params: any) => params.status?.name,
            },
            {
                field: "comment",
                headerName: "Комментарий",
                width: "120px",
                hide: false,
            },
            {
                field: "", headerName: "", width: "0px", hide: false, renderCell: (params: any) => (
                    <div className="flex gap-[20px]">
                        {pageAccessRule.edit &&
                            <IconButton onClick={() => {
                                getLeads(params, 'edit')
                            }}>
                                <EditIcon/>
                            </IconButton>
                        }
                        {pageAccessRule.delete &&
                            <IconButton onClick={() => {
                                getLeads(params, 'delete')
                            }}>
                                <DeleteIcon style={{color: 'red'}}/>
                            </IconButton>
                        }
                    </div>
                )
            },
        ],
    });


    const tableList = LeadsService.LeadsList(table.filter);
    const leadsStatusList = LeadsService.GetLeadsStatusesList();
    const sourceList = TrafficSourceService.GetTrafficSourceList();
    const managerList = ManagerService.GetManager();

    const [isLoading, setIsLoading] = useState(false)

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

        const payload = modal.values;
        for (let key in payload) {
            if (key === 'date') {
                payload[key] = moment(payload[key]?.$d).format('YYYY-MM-DD');
            }
            if (key === 'reminder_date') {
                payload[key] = moment(payload[key]?.$d).format('YYYY-MM-DD hh:mm');
            }
            if (payload[key] === '') {
                delete payload[key]
            }
        }

        switch (modal.action) {
            case "add":
                setIsLoading(true)
                LeadsService.CreateLeads(payload)
                    .then(() => {
                        tableList.execute()
                        setModal(modalInitialValues);
                    }).catch((err) => {
                    checkModalResponse(err.response.data)
                }).finally(() => {
                    setIsLoading(false)
                })
                break;

            case "edit":
                setIsLoading(true)
                LeadsService.UpdateLeads(payload)
                    .then(() => {
                        tableList.execute()
                        setModal(modalInitialValues);
                    }).catch((err) => {
                    checkModalResponse(err.response.data)
                }).finally(() => {
                    setIsLoading(false)
                })
                break;

            case "delete":
                setIsLoading(true)
                LeadsService.DeleteLeads(payload.id)
                    .then(() => {
                        tableList.execute()
                        setModal(modalInitialValues);
                    }).catch((err) => {
                    checkModalResponse(err.response.data)
                }).finally(() => {
                    setIsLoading(false)
                })
                break;
        }
    };

    const getLeads = async (params: any, action: string) => {
        setModal({
            ...modal,
            open: true,
            action: action,
            values: {
                ...modal.values,
                ...params,
                status: params.status?.id,
                user: params.user?.id,
                traffic_source: params.traffic_source?.id,
                reminder_date: params.reminder_date ? dayjs(params.reminder_date) : null,
                date: params.date ? dayjs(params.date) : null,
            },
        });
    }

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
                <h1 className="text-[36px] font-bold">Лиды</h1>

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
                    <TextField
                        size='small'
                        type='date'
                        variant="outlined"
                        placeholder='Начало'
                        value={table.filter.start_date}
                        onChange={(e) => {
                            setTable({
                                ...table,
                                filter: {
                                    ...table.filter,
                                    start_date: e.target.value,
                                },
                            });
                        }}
                        InputProps={{
                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                        }}
                    />

                    <TextField
                        size='small'
                        type='date'
                        variant="outlined"
                        placeholder='Конец'
                        value={table.filter.end_date}
                        onChange={(e) => {
                            setTable({
                                ...table,
                                filter: {
                                    ...table.filter,
                                    end_date: e.target.value,
                                },
                            });
                        }}
                        InputProps={{
                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                        }}
                    />

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
                            {!leadsStatusList.loading && !leadsStatusList.error &&
                                leadsStatusList.result?.data.map((status: any, index: number) => (
                                    <MenuItem key={index} value={status.id}>{status.name}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </div>
            </div>


            <CustomTable
                columns={table.columns}
                rows={table.rows}
                checkboxSelection={false}
                loading={table.status.loading}
                error={table.status.error}
                message={table.status.message}
                onRowDoubleClick={(params: any) => (navigate(`/leads/${params.id}`))}
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
                            {modal.action === "add" && "Добавить лида"}
                            {modal.action === "edit" && "Редактировать данные лида"}
                            {modal.action === "delete" && `Удалить?`}
                        </h1>

                        <form onSubmit={handleSubmitModalForm} className="pt-[40px] w-full">
                            {modal.action !== "delete" ? (
                                <div>
                                    <div className="grid grid-cols-2 gap-[30px] gap-x-[60px]">

                                        <TextField
                                            variant={'outlined'}
                                            type="text"
                                            helperText={modal.validation.message.full_name}
                                            error={modal.validation.error.full_name}
                                            label="Клиент"
                                            value={modal.values.full_name}
                                            onChange={(event: any) => {
                                                setModal({
                                                    ...modal,
                                                    values: {
                                                        ...modal.values,
                                                        full_name: event.target.value,
                                                    },
                                                });
                                            }}
                                            InputProps={{sx: {backgroundColor: 'white', borderRadius: '50px'}}}
                                        />

                                        <TextField
                                            variant={'outlined'}
                                            type="text"
                                            helperText={modal.validation.message.phone}
                                            error={modal.validation.error.phone}
                                            label="Номер"
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
                                            InputProps={{sx: {backgroundColor: 'white', borderRadius: '50px'}}}
                                        />

                                        <FormControl>
                                            <InputLabel>Статус</InputLabel>
                                            <Select
                                                autoWidth={true}
                                                style={{
                                                    borderRadius: '50px',
                                                    minWidth: '120px',
                                                    backgroundColor: "white"
                                                }}
                                                label="Статус"
                                                value={modal.values.status}
                                                onChange={(event: any) => {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            status: event.target.value,
                                                        },
                                                    });
                                                }}
                                            >
                                                <MenuItem value=""><em>None</em></MenuItem>
                                                {!leadsStatusList.loading && !leadsStatusList.error &&
                                                    leadsStatusList.result?.data.map((status: any, index: number) => (
                                                        <MenuItem key={index}
                                                                  value={status.id}>{status.name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>

                                        <FormControl>
                                            <InputLabel>Менеджер</InputLabel>
                                            <Select
                                                autoWidth={true}
                                                style={{
                                                    borderRadius: '50px',
                                                    minWidth: '120px',
                                                    backgroundColor: "white"
                                                }}
                                                label="Менеджер"
                                                value={modal.values.user}
                                                onChange={(event: any) => {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            user: event.target.value,
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

                                        <FormControl>
                                            <InputLabel>Источник</InputLabel>
                                            <Select
                                                autoWidth={true}
                                                style={{
                                                    borderRadius: '50px',
                                                    minWidth: '120px',
                                                    backgroundColor: "white"
                                                }}
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
                                                {!sourceList.loading && !sourceList.error &&
                                                    sourceList.result?.data.map((source: any, index: number) => (
                                                        <MenuItem key={index}
                                                                  value={source.id}>{source.name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>

                                        <DatePicker label="Дата"
                                                    format={'YYYY-MM-DD'}
                                                    slotProps={{
                                                        textField: {
                                                            InputProps: {
                                                                sx: {borderRadius: '50px', backgroundColor: 'white'},
                                                            }
                                                        },
                                                    }}
                                                    value={modal.values.date ? dayjs(modal.values.date) : null}
                                                    onChange={(date) => {
                                                        setModal({
                                                            ...modal,
                                                            values: {
                                                                ...modal.values,
                                                                date: date ? date.format("YYYY-MM-DD") : null,
                                                            },
                                                        });
                                                    }}
                                        />

                                        <DateTimePicker label="Напоминание"
                                                        format={'YYYY-MM-DD hh:mm'}
                                                        slotProps={{
                                                            textField: {
                                                                InputProps: {
                                                                    sx: {
                                                                        borderRadius: '50px',
                                                                        backgroundColor: 'white'
                                                                    },
                                                                }
                                                            },
                                                        }}
                                                        value={modal.values.reminder_date ? dayjs(modal.values.reminder_date) : null}
                                                        onChange={(date) => {
                                                            setModal({
                                                                ...modal,
                                                                values: {
                                                                    ...modal.values,
                                                                    reminder_date: date ? date.format("YYYY-MM-DD") : null,
                                                                },
                                                            });
                                                        }}
                                        />

                                    </div>
                                    <div className="mt-[30px] h-[139px]">
                                                <textarea
                                                    onChange={(event: any) => {
                                                        setModal({
                                                            ...modal,
                                                            values: {
                                                                ...modal.values,
                                                                comment: event.target.value,
                                                            },
                                                        });
                                                    }} value={modal.values.comment}
                                                    className="shadow-blog-2 outline-none rounded-[20px] p-4 w-full text-[12px] resize-none"
                                                    id="w3review" name="w3review" rows={4} cols={20}></textarea>

                                    </div>
                                </div>
                            ) : (
                                ""
                            )}

                            <div className="flex justify-center w-full mt-[50px]">
                                <button
                                    type="submit"
                                    className={`outline-none text-[12px] py-[14px] px-[14px] bg-[#4E54E1] text-white rounded-[100px] w-[259px] ${isLoading ? "cursor-not-allowed opacity-50" : ""} `}
                                    disabled={isLoading}
                                >
                                    {
                                        isLoading ? (
                                            <div className="flex justify-center">
                                                <div
                                                    className="w-[19px] h-[19px] border-2 border-white border-t-transparent animate-spin rounded-full">

                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {modal.action === "delete" && "Удалить"}
                                                {modal.action === "edit" && "Готово"}
                                                {modal.action === "add" && "Готово"}
                                            </div>)
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                }
            />
        </>
    );
}

