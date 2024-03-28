import React, {useEffect, useState} from "react";
import AddIcon from '@mui/icons-material/Add';
import {
    CheckForPositiveNumbers,
    CustomModal,
    CustomPageSizeInput,
    CustomTable,
    ValidateFormSubmitResponse
} from "../helpers/helpers";
import {
    Autocomplete,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    TextField
} from "@mui/material";
import {IncomesService} from "../service/IncomesService";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from "@mui/icons-material/Search";
import moment from "moment/moment";
import dayjs from "dayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {getCookie} from "typescript-cookie";
import {position} from "../https/axiosInstance";
import {useLocation, useNavigate} from "react-router-dom";
import {accessRules} from "../components/MiddleWare";

const modalInitialValues: any = {
    open: false,
    values: {
        id: "",
        act_number: "",
        account_number: "",
        amount: "",
        date: null,
        payment_type: "",
        project: '',
    },
    validation: {
        error: {
            act_number: "",
            account_number: "",
            amount: "",
            date: "",
            payment_types: ""
        },
        message: {
            act_number: "",
            account_number: "",
            amount: "",
            date: "",
            payment_types: ""
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
        start_date: "",
        end_date: "",
        size: 20,
        page: 1,
        total_pages: 1,
    },
}

export default function IncomesPage() {
    const userPosition = typeof getCookie(position) !== 'undefined' ? getCookie(position) : ''
    const location = useLocation()
    const [pageAccessRule] = useState(() => {
        let rule: any = {};
        for (const key in accessRules) {
            if (location.pathname.includes(key)) {
                rule = accessRules[key].find((position: any) => position.position === userPosition)
            }
        }
        return rule.privileges
    })


    const [modal, setModal] = useState(modalInitialValues);
    const [table, setTable] = useState({
        ...tableInitialValues,
        columns: [
            {field: "id", headerName: "id", width: "120px", hide: true},
            {field: "act_number", headerName: "№ акта", width: "120px", hide: false},

            {
                field: "amount",
                headerName: "Сумма",
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
                field: "project",
                headerName: "Проект",
                width: "120px",
                hide: false,
                renderCell: (params: any) => params.project?.name,
            },
            {
                field: "payment_type",
                headerName: "Способ оплаты",
                width: "120px",
                hide: false,
                renderCell: (params: any) => params.payment_type?.name,
            },

            {
                field: "", headerName: "", width: "0px", hide: false, renderCell: (params) => (
                    <div className="flex gap-[20px]">
                        {pageAccessRule.edit &&
                            <IconButton onClick={() => {
                                getIncomes(params, 'edit')
                            }}>
                                <EditIcon/>
                            </IconButton>
                        }
                        {pageAccessRule.delete &&
                            <IconButton onClick={() => {
                                getIncomes(params, 'delete')
                            }}>
                                <DeleteIcon style={{color: 'red'}}/>
                            </IconButton>
                        }
                    </div>
                )
            },
        ],
    });

    const tableList = IncomesService.IncomesList(table.filter);
    const getPaymentTypesList = IncomesService.GetPaymentTypesList()

    const [projectName, setProjectName] = useState('')

    //создать отдельную апишку внутри приходов
    const projectList = IncomesService.GetProjectList({search: projectName})

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
            if (payload[key] === '') {
                delete payload[key]
            }
        }
        switch (modal.action) {
            case "add":
                setIsLoading(true)
                IncomesService.CreateIncomes(payload)
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
                IncomesService.UpdateIncomes(payload)
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
                IncomesService.DeleteIncomes(payload.id)
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
    const getIncomes = async (params: any, action: string) => {
        setModal({
            ...modal,
            open: true,
            action: action,
            values: {
                ...modal.values,
                ...params,
                project: params.project?.id,
                payment_type: params.payment_type?.id,
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
        <div id='incomesPage'>
            <div className="flex items-center justify-between">
                <h1 className="text-[36px] font-bold">Приход</h1>

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
                            {modal.action === "add" && "Добавить приход"}
                            {modal.action === "edit" && "Редактировать приход"}
                            {modal.action === "delete" && `Удалить?`}
                        </h1>

                        <form onSubmit={handleSubmitModalForm} className="pt-[40px] w-full">
                            {modal.action !== "delete" ? (
                                <div className="grid grid-cols-2 gap-[30px] gap-x-[60px]">
                                    <TextField
                                        variant={'outlined'}
                                        type="text"
                                        helperText={modal.validation.message.act_number}
                                        error={modal.validation.error.account_number}
                                        label="№ акта"
                                        value={modal.values.act_number}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    act_number: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />
                                    <TextField
                                        variant={'outlined'}
                                        type="text"
                                        helperText={modal.validation.message.account_number}
                                        error={modal.validation.error.account_number}
                                        label="Номер аккаунта"
                                        value={modal.values.account_number}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    account_number: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />

                                    <TextField
                                        variant={'outlined'}
                                        type="number"
                                        helperText={modal.validation.message.amount}
                                        error={modal.validation.error.amount}
                                        label="Сумма"
                                        value={modal.values.amount}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    amount: event.target.value,
                                                },
                                            });
                                        }}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'}
                                        }}
                                    />

                                    <Autocomplete
                                        freeSolo
                                        options={
                                            !projectList.loading && !projectList.error
                                                ? [
                                                    ...projectList.result?.data.map((status: any) => ({
                                                        id: status.id,
                                                        label: status.name,
                                                    })),
                                                ]
                                                : []
                                        }
                                        isOptionEqualToValue={(option: any, value: any) => option.label === value.label}
                                        disableCloseOnSelect
                                        getOptionLabel={(option) => option.label}
                                        onChange={(event, value) => {
                                            if (value) {
                                                setModal({
                                                    ...modal,
                                                    values: {
                                                        ...modal.values,
                                                        project: value.id
                                                    }
                                                });
                                            }
                                        }}
                                        inputValue={projectName}
                                        onInputChange={(event, newInputValue) => {
                                            if (newInputValue === '') {
                                                setModal({
                                                    ...modal,
                                                    values: {
                                                        ...modal.values,
                                                        project: ''
                                                    }
                                                })
                                                setProjectName(newInputValue)
                                            } else {
                                                setProjectName(newInputValue)
                                            }
                                        }}
                                        loading={projectList.loading}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    sx: {borderRadius: '50px', backgroundColor: 'white'}
                                                }}
                                                label="Проект" placeholder="Поиск..."
                                            />
                                        )}
                                    />

                                    <FormControl>
                                        <InputLabel>Способ оплаты</InputLabel>
                                        <Select
                                            autoWidth={true}
                                            style={{
                                                borderRadius: '50px',
                                                minWidth: '120px',
                                                backgroundColor: "white"
                                            }}
                                            label="Способ оплаты"
                                            value={modal.values.payment_type}
                                            onChange={(event: any) => {
                                                setModal({
                                                    ...modal,
                                                    values: {
                                                        ...modal.values,
                                                        payment_type: event.target.value,
                                                    },
                                                });
                                            }}
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {!getPaymentTypesList.loading && !getPaymentTypesList.error &&
                                                getPaymentTypesList.result?.data.map((payment: any, index: number) => (
                                                    <MenuItem key={index}
                                                              value={payment.id}>{payment.name}</MenuItem>
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
                                </div>
                            ) : (
                                ""
                            )}

                            <div className="flex justify-center w-full mt-[50px]">
                                <button
                                    type="submit"
                                    className={`outline-none text-[12px] py-[14px] px-[14px] bg-[#4E54E1] text-white rounded-[100px] w-[259px] ${isLoading ? "cursor-not-allowed z-50 opacity-50" : ""}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex justify-center">
                                            <div
                                                className="w-[19px] h-[19px] border-2 rounded-full border-t-transparent border-white animate-spin"></div>
                                        </div>
                                    ) : (<div>
                                        {modal.action === "delete" && "Удалить"}
                                        {modal.action === "edit" && "Готово"}
                                        {modal.action === "add" && "Готово"}
                                    </div>)}

                                </button>
                            </div>
                        </form>
                    </div>
                }
            />
        </div>
    );
}

