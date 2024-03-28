import React, {useEffect, useState} from "react";
import {
    CheckForPositiveNumbers,
    CustomModal,
    CustomPageSizeInput,
    CustomTable,
    ValidateFormSubmitResponse,
} from "../helpers/helpers";
import {FormControl, IconButton, InputLabel, MenuItem, Pagination, Select, TextField} from "@mui/material";
import {ExpensesService} from "../service/ExpensesService";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from "dayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ClearIcon from "@mui/icons-material/Clear";
import moment from "moment";
import {CommonService} from "../service/CommonService";
import AddIcon from "@mui/icons-material/Add";
import {getCookie} from "typescript-cookie";
import {position} from "../https/axiosInstance";
import {useLocation, useNavigate} from "react-router-dom";
import {accessRules} from "../components/MiddleWare";

const modalInitialValues = {
    open: false,
    values: {
        id: "",
        expense_type: "",
        amount: "",
        date: null,
        comment: "",
        attachment: new File([""], ''),
    },
    validation: {
        error: {
            expense_type: false,
            amount: false,
            date: false,
            comment: false,
            attachment: false,
        },
        message: {
            expense_type: "",
            amount: "",
            date: "",
            comment: "",
            attachment: "",
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
        expense_type: "",
        size: 20,
        page: 1,
        total_pages: 1,
    },
}

export default function ExpensesPage() {
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


    const [modal, setModal] = useState<any>(modalInitialValues);
    const [table, setTable] = useState({
        ...tableInitialValues,
        columns: [
            {field: "id", headerName: "id", width: "120px", hide: true},
            {
                field: "expense_type",
                headerName: "Тип расхода",
                width: "120px",
                hide: false,
                renderCell: (params: any) => params.expense_type?.name,
            },

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
                                getExpense(params, 'edit')
                            }}>
                                <EditIcon/>
                            </IconButton>
                        }
                        {pageAccessRule.delete &&
                            <IconButton onClick={() => {
                                getExpense(params, 'delete')
                            }}>
                                <DeleteIcon style={{color: 'red'}}/>
                            </IconButton>
                        }
                    </div>
                )
            },
        ],
    });

    const tableList = ExpensesService.ExpensesList(table.filter);
    const expensesTypeList = ExpensesService.GetExpensesTypeList();

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
                ExpensesService.CreateExpenses(payload)
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
                ExpensesService.UpdateExpenses(payload)
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
                ExpensesService.DeleteExpenses(payload.id)
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

    const getExpense = async (params: any, action: string) => {
        let attachment = new File([""], '')
        if (action !== 'delete') {
            attachment = await CommonService.convertImageUrlToFile(params.attachment).catch(() => new File([""], ''));
        }

        setModal({
            ...modal,
            open: true,
            action: action,
            values: {
                ...modal.values,
                ...params,
                attachment,
                expense_type: params.expense_type?.id,
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
                <h1 className="text-[36px] font-bold">Расход</h1>

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
                        <InputLabel>Тип расхода</InputLabel>
                        <Select
                            autoWidth={true}
                            style={{borderRadius: '50px', minWidth: '140px', backgroundColor: "white"}}
                            value={table.filter.expense_type}
                            label="Тип расхода"
                            onChange={(event) => {
                                setTable({
                                    ...table,
                                    filter: {
                                        ...table.filter,
                                        expense_type: event.target.value,
                                    },
                                });
                            }}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {!expensesTypeList.loading && !expensesTypeList.error &&
                                expensesTypeList.result?.data.map((expense_type: any, index: number) => (
                                    <MenuItem key={index} value={expense_type.id}>{expense_type.name}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>

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
                            {modal.action === "add" && "Добавить расход"}
                            {modal.action === "edit" && "Редактировать расход"}
                            {modal.action === "delete" && `Удалить?`}
                        </h1>

                        <form onSubmit={handleSubmitModalForm} className="pt-[40px] w-full">
                            {modal.action !== "delete" ? (
                                <div>
                                    <div className="grid grid-cols-2 gap-[30px] gap-x-[60px]">
                                        <FormControl>
                                            <InputLabel>Тип расхода</InputLabel>
                                            <Select
                                                autoWidth={true}
                                                style={{
                                                    borderRadius: '50px',
                                                    minWidth: '120px',
                                                    backgroundColor: "white"
                                                }}
                                                label="Тип расхода"
                                                value={modal.values.expense_type}
                                                onChange={(event: any) => {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            expense_type: event.target.value,
                                                        },
                                                    });
                                                }}
                                            >
                                                <MenuItem value=""><em>None</em></MenuItem>
                                                {!expensesTypeList.loading && !expensesTypeList.error &&
                                                    expensesTypeList.result?.data.map((expense: any, index: number) => (
                                                        <MenuItem key={index}
                                                                  value={expense.id}>{expense.name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            variant={"outlined"}
                                            type="text"
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

                                        <TextField
                                            variant="outlined"
                                            type="text"
                                            label="Вложение"
                                            value={modal.values.attachment.name}
                                            InputProps={{
                                                sx: {borderRadius: '50px', backgroundColor: 'white'},
                                                endAdornment:
                                                    <div>
                                                        {modal.values.attachment.name === ''
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
                                                                                       attachment: event.target.files[0]
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
                                                                        attachment: new File([''], '')
                                                                    },
                                                                });
                                                            }}>
                                                                <ClearIcon/>
                                                            </IconButton>
                                                        }
                                                    </div>
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
                                                    className="shadow-blog-2 outline-none rounded-[20px] p-4 w-full text-[12px]"
                                                    id="w3review" name="w3review" rows={4} cols={20}></textarea>
                                    </div>
                                </div>
                            ) : (
                                ""
                            )}

                            <div className="flex justify-center w-full mt-[50px]">
                                <button
                                    type="submit"
                                    className={`outline-none text-[12px] py-[14px] px-[14px] bg-[#4E54E1] text-white rounded-[100px] w-[259px] 
                                    ${isLoading ? "cursor-not-allowed opacity-50" : ""}
                                    `}
                                    disabled={isLoading}
                                >
                                    {
                                        isLoading ? (
                                            <div className="flex justify-center">
                                                <div
                                                    className="w-[19px] h-[19px] border-2 rounded-full border-white border-t-transparent animate-spin">
                                                </div>
                                            </div>) : (
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

