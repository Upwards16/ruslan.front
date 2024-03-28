import React, {useEffect, useState} from "react";
import {EmployeesService} from "../service/EmployeesService";
import {PositionsService} from "../service/PositionsService";
import {StatusService} from "../service/StatusService";
import {
    CheckForPositiveNumbers,
    CustomModal,
    CustomPageSizeInput,
    CustomTable,
    InputCheckForNumbers,
    ValidateFormSubmitResponse,
    ValidatePhoneNumber
} from "../helpers/helpers";
import {FormControl, IconButton, InputLabel, MenuItem, Pagination, Select, TextField} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from "@mui/icons-material/Search";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ClearIcon from '@mui/icons-material/Clear';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {CommonService} from "../service/CommonService";
import moment from "moment/moment";
import AddIcon from "@mui/icons-material/Add";
import {useLocation, useNavigate} from "react-router-dom";
import {getCookie} from "typescript-cookie";
import {position} from "../https/axiosInstance";
import {accessRules} from "../components/MiddleWare";

const modalInitialValues = {
    open: false,
    values: {
        id: "",
        lastname: "",
        firstname: "",
        status: "",
        position: "",
        date_of_birth: null,
        phone: "",
        bank_details: "",
        cv: new File([""], ''),
        telegram: "",
        linkedin: "",
        github: "",
        salary: "",
        email: "",
        date_start_work: null,
        hourly_payment_cost: "",
        password: "",
    },
    validation: {
        error: {
            lastname: false,
            firstname: false,
            status: false,
            position: false,
            date_of_birth: false,
            phone: false,
            bank_details: false,
            cv: false,
            telegram: false,
            linkedin: false,
            github: false,
            salary: false,
            email: false,
            date_start_work: false,
            hourly_payment_cost: false,
            password: false,
        },
        message: {
            lastname: "",
            firstname: "",
            status: "",
            position: "",
            date_of_birth: "",
            phone: "",
            bank_details: "",
            cv: '',
            telegram: "",
            linkedin: "",
            github: "",
            salary: "",
            email: "",
            date_start_work: "",
            hourly_payment_cost: "",
            password: "",
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
        search: "",
        position: "",
        status: "",
        size: 20,
        page: 1,
        total_pages: 1,
    },
}

export default function EmployeesPage() {
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
            {field: "id", headerName: "id", hide: true},
            {
                field: "fullname", headerName: "ФИО", hide: false, renderCell: (params: any) =>
                    <p>
                        {`${params.firstname} ${params.lastname}`}
                    </p>
            },
            {
                field: "position",
                headerName: "Должность",
                width: "120px",
                renderCell: (params: any) => params.position?.name,
            },
            {field: "date_start_work", headerName: "Дата найма", width: "120px",},
            {field: "status", headerName: "Статус", width: "120px", renderCell: (params: any) => params.status?.name},
            {
                field: "", headerName: "", width: '100px', renderCell: (params: any) => (
                    <div className="flex gap-[20px]">
                        {pageAccessRule.edit &&
                            <IconButton onClick={() => {
                                getEmployee(params, 'edit')
                            }}>
                                <EditIcon/>
                            </IconButton>
                        }
                        {pageAccessRule.delete &&
                            <IconButton onClick={() => {
                                getEmployee(params, 'delete')
                            }}>
                                <DeleteIcon style={{color: 'red'}}/>
                            </IconButton>
                        }
                    </div>
                )
            },
        ]
    });

    const tableList = EmployeesService.GetEmployeeList(table.filter);
    const statusList = StatusService.GetStatusList();
    const positionList = PositionsService.GetPositionList();

    const [isLoading, setIsLoading] = useState(false);

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
            if (key === 'date_of_birth' || key === 'date_start_work') {
                payload[key] = moment(payload[key]?.$d).format('YYYY-MM-DD');
            }
            if (payload[key] === '') {
                delete payload[key]
            }
        }

        switch (modal.action) {
            case "add":
                setIsLoading(true);
                EmployeesService.CreateEmployee(payload)
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

                EmployeesService.UpdateEmployee(payload)
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

                EmployeesService.DeleteEmployee(payload.id)
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

    const getEmployee = async (params: any, action: string) => {
        let cv = new File([""], '')
        if (action !== 'delete') {
            cv = await CommonService.convertImageUrlToFile(params.cv).catch(() => new File([""], ''));
        }
        setModal({
            ...modal,
            open: true,
            action: action,
            values: {
                ...modal.values,
                ...params,
                cv,
                status: params.status?.id,
                position: params.position?.id,
                date_of_birth: params.date_of_birth ? dayjs(params.date_of_birth) : null,
                date_start_work: params.date_start_work ? dayjs(params.date_start_work) : null,
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
                status: tableInitialValues.status,
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
                <h1 className="text-[36px] font-bold">Сотрудники</h1>
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

            {/* filters */}

            <div className=" flex items-center justify-between mt-[42px]">
                <div className="flex items-center gap-[20px]">
                    <FormControl size={'small'}>
                        <InputLabel>Должность</InputLabel>
                        <Select
                            autoWidth={true}
                            style={{borderRadius: '50px', minWidth: '130px', backgroundColor: "white"}}
                            value={table.filter.position}
                            label="Должность"
                            onChange={(event) => {
                                setTable({
                                    ...table,
                                    filter: {
                                        ...table.filter,
                                        position: event.target.value,
                                    },
                                });
                            }}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {!positionList.loading && !positionList.error &&
                                positionList.result?.data.map((position: any, index: number) => (
                                    <MenuItem key={index} value={position.id}>{position.name}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
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

            {/* table */}

            <CustomTable
                columns={table.columns}
                rows={table.rows}
                checkboxSelection={false}
                loading={table.status.loading}
                error={table.status.error}
                message={table.status.message}
                onRowDoubleClick={(params: any) => navigate(`/employees/${params.id}`)}
                footer={
                    <div className="bg-white flex justify-between items-center p-2.5 pt-[40px] pl-[30px] pb-[20px]">
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
                    setModal(modalInitialValues)
                }}
                children={
                    <div className="flex flex-col text-[#505050]">
                        <h1 className="text-[24px] font-bold text-center">
                            {modal.action === "add" && "Добавить сотрудника"}
                            {modal.action === "edit" && "Редактировать данные сотрудника"}
                            {modal.action === "delete" && `Удалить сотрудника ${modal.values.firstname} ${modal.values.lastname}?`}
                        </h1>

                        <form onSubmit={handleSubmitModalForm} className="pt-[40px] w-full">
                            {modal.action !== "delete" ? (
                                <div className="grid grid-cols-2 gap-[30px] gap-x-[60px]">
                                    <TextField
                                        variant="outlined"
                                        label='Фамилия'
                                        helperText={modal.validation.message.lastname}
                                        error={modal.validation.error.lastname}
                                        value={modal.values.lastname}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    lastname: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />
                                    <TextField
                                        variant="outlined"
                                        helperText={modal.validation.message.firstname}
                                        error={modal.validation.error.firstname}
                                        label="Имя"
                                        value={modal.values.firstname}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    firstname: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />

                                    <FormControl>
                                        <InputLabel>Статус</InputLabel>
                                        <Select
                                            autoWidth={true}
                                            style={{borderRadius: '50px', minWidth: '120px', backgroundColor: "white"}}
                                            label="Статус"
                                            value={modal.values.status}
                                            onChange={(event) => {
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
                                            {!statusList.loading && !statusList.error &&
                                                statusList.result?.data.map((status: any, index: number) => (
                                                    <MenuItem key={index} value={status.id}>{status.name}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <InputLabel>Должность</InputLabel>
                                        <Select
                                            autoWidth={true}
                                            style={{borderRadius: '50px', minWidth: '120px', backgroundColor: "white"}}
                                            label="Должность"
                                            value={modal.values.position}
                                            onChange={(event) => {
                                                setModal({
                                                    ...modal,
                                                    values: {
                                                        ...modal.values,
                                                        position: event.target.value,
                                                    },
                                                });
                                            }}
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {!positionList.loading && !positionList.error &&
                                                positionList.result?.data.map((position: any, index: number) => (
                                                    <MenuItem key={index} value={position.id}>{position.name}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>

                                    <DatePicker label="Дата рождения"
                                                format={'YYYY-MM-DD'}
                                                slotProps={{
                                                    textField: {
                                                        InputProps: {
                                                            sx: {borderRadius: '50px', backgroundColor: 'white'},
                                                        }
                                                    },
                                                }}
                                                value={modal.values.date_of_birth ? dayjs(modal.values.date_of_birth) : null}
                                                onChange={(date) => {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            date_of_birth: date ? date.format('YYYY-MM-DD') : null,
                                                        },
                                                    });
                                                }}
                                    />

                                    <DatePicker label="Дата найма"
                                                format={'YYYY-MM-DD'}
                                                slotProps={{
                                                    textField: {
                                                        InputProps: {
                                                            sx: {borderRadius: '50px', backgroundColor: 'white'},
                                                        }
                                                    },
                                                }}
                                                value={modal.values.date_start_work ? dayjs(modal.values.date_start_work) : null}
                                                onChange={(date) => {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            date_start_work: date ? date.format('YYYY-MM-DD') : null,
                                                        },
                                                    });
                                                }}
                                    />

                                    <TextField
                                        variant="outlined"
                                        type={"text"}
                                        helperText={modal.validation.message.phone}
                                        error={modal.validation.error.phone}
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
                                    <TextField
                                        variant="outlined"
                                        type="number"
                                        helperText={modal.validation.message.bank_details}
                                        error={modal.validation.error.bank_details}
                                        label="Реквизиты"
                                        value={modal.values.bank_details}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    bank_details: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />

                                    <TextField
                                        variant="outlined"
                                        type="text"
                                        label="Резюме"
                                        value={modal.values.cv.name}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'},
                                            endAdornment:
                                                <div>
                                                    {modal.values.cv.name === ''
                                                        ?
                                                        <IconButton>
                                                            <label>
                                                                <input type={'file'}
                                                                       className='absolute w-[1px] h-[1px] top-0 left-0 text-[0px] overflow-hidden'
                                                                       onChange={(event: any) => {
                                                                           setModal({
                                                                               ...modal,
                                                                               values: {
                                                                                   ...modal.values,
                                                                                   cv: event.target.files[0]
                                                                               },
                                                                           });
                                                                       }}
                                                                />
                                                                <FileUploadIcon/>
                                                            </label>
                                                        </IconButton>
                                                        :
                                                        <IconButton onClick={() => {
                                                            setModal({
                                                                ...modal,
                                                                values: {
                                                                    ...modal.values,
                                                                    cv: new File([''], '')
                                                                },
                                                            });
                                                        }}>
                                                            <ClearIcon/>
                                                        </IconButton>
                                                    }
                                                </div>
                                        }}
                                    />

                                    <TextField
                                        variant="outlined"
                                        type="text"
                                        helperText={modal.validation.message.telegram}
                                        error={modal.validation.error.telegram}
                                        label="Telegram"
                                        value={modal.values.telegram}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    telegram: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />

                                    <TextField
                                        variant="outlined"
                                        type="text"
                                        helperText={modal.validation.message.linkedin}
                                        error={modal.validation.error.linkedin}
                                        label="Linkedin"
                                        value={modal.values.linkedin}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    linkedin: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />

                                    <TextField
                                        variant="outlined"
                                        type="text"
                                        helperText={modal.validation.message.github}
                                        error={modal.validation.error.github}
                                        label="Github"
                                        value={modal.values.github}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    github: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />

                                    <TextField
                                        variant="outlined"
                                        type="number"
                                        helperText={modal.validation.message.salary}
                                        error={modal.validation.error.salary}
                                        label="Заработная плата"
                                        value={modal.values.salary}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    salary: InputCheckForNumbers(event.target.value),
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />
                                    <TextField
                                        variant="outlined"
                                        type="email"
                                        helperText={modal.validation.message.email}
                                        error={modal.validation.error.email}
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


                                    <TextField
                                        variant="outlined"
                                        type="number"
                                        helperText={modal.validation.message.hourly_payment_cost}
                                        error={modal.validation.error.hourly_payment_cost}
                                        label="Почасовая оплата"
                                        value={modal.values.hourly_payment_cost}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    hourly_payment_cost: InputCheckForNumbers(event.target.value),
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />

                                    <TextField
                                        variant="outlined"
                                        type="text"
                                        label="Пароль"
                                        helperText={modal.validation.message.password}
                                        error={modal.validation.error.password}
                                        value={modal.values.password}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    password: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />
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

