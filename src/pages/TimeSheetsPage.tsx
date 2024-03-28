import React, {useEffect, useState} from "react";
import {
    CheckForPositiveNumbers,
    CustomModal,
    CustomPageSizeInput,
    CustomTable,
    ValidateFormSubmitResponse,
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from "dayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import moment from "moment";
import AddIcon from "@mui/icons-material/Add";
import {TimeSheetsService} from "../service/TimeSheetsService";
import {getCookie} from "typescript-cookie";
import {position} from "../https/axiosInstance";
import {useLocation, useNavigate} from "react-router-dom";
import {accessRules} from "../components/MiddleWare";


const modalInitialValues = {
    open: false,
    values: {
        id: "",
        date: null,
        time: "",
        comment: "",
        task: "",
        project: ""
    },
    validation: {
        error: {
            date: false,
            time: false,
            comment: false,
            task: false,
            project: false,
        },
        message: {
            date: "",
            time: "",
            comment: "",
            task: '',
            project: '',
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
        size: 20,
        page: 1,
        total_pages: 1,
    },
}

export default function TimeSheetsPage() {
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
                field: "date",
                headerName: "Дата",
                width: "120px",
                hide: false,
                renderCell: (params: any) => params.date !== null ? moment(params.date).format('DD.MM.YYYY') : ''
            },
            {
                field: "project",
                headerName: "Проект",
                width: "120px",
                hide: false,
                renderCell: (params: any) => params.task?.project?.name
            },
            {
                field: "task",
                headerName: "Задача",
                width: "150px",
                hide: false,
                renderCell: (params: any) => <p>
                    {params.task?.task}
                </p>
            },
            {
                field: "time",
                headerName: "Время",
                width: "120px",
                hide: false,
                renderCell: (params: any) => <p>{params.time} ч</p>
            },
            {
                field: "comment",
                headerName: "Комментарий",
                hide: false,
            },
            {
                field: "", headerName: "", width: "0px", hide: false, renderCell: (params: any) => (
                    <div className="flex gap-[20px]">
                        {pageAccessRule.edit &&
                            <IconButton onClick={() => {
                                getTimeSheet(params, 'edit')
                            }}>
                                <EditIcon/>
                            </IconButton>
                        }
                        {pageAccessRule.delete &&
                            <IconButton onClick={() => {
                                getTimeSheet(params, 'delete')
                            }}>
                                <DeleteIcon style={{color: 'red'}}/>
                            </IconButton>
                        }
                    </div>
                )
            },
        ],
    });

    const tableList = TimeSheetsService.TimeSheetsList(table.filter);

    const [projectSearchName, setProjectSearchName] = useState('')
    const projectList = TimeSheetsService.GetProjectList({
        search: projectSearchName
    })

    const taskList = TimeSheetsService.GetTaskList({
        project: modal.values.project
    })

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
                TimeSheetsService.CreateTimeSheets(payload)
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
                TimeSheetsService.UpdateTimeSheets(payload)
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
                TimeSheetsService.DeleteTimeSheets(payload.id)
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

    const getTimeSheet = async (params: any, action: string) => {
        setModal({
            ...modal,
            open: true,
            action: action,
            values: {
                ...modal.values,
                ...params,
                project: params.task?.project?.id,
                task: params.task?.id,
                date: params.date ? dayjs(params.date) : null,
            },
        });
        setProjectSearchName(params.task?.project?.name)
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
                <h1 className="text-[36px] font-bold">Time sheets</h1>

                <IconButton onClick={() => {
                    setModal({
                        ...modal,
                        open: true,
                        values: modalInitialValues.values,
                        action: "add",
                    });
                    setProjectSearchName('')
                }} sx={{
                    padding: '14px',
                    backgroundColor: '#4E54E1',
                    "&:hover": {opacity: '0.8', backgroundColor: '#4E54E1'}
                }}>
                    <AddIcon sx={{color: '#FFF'}}/>
                </IconButton>
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
            </div>

            <CustomTable
                columns={table.columns}
                rows={table.rows}
                checkboxSelection={false}
                loading={table.status.loading}
                error={table.status.error}
                message={table.status.message}
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
                    setModal({...modal, open: false});
                }}
                children={
                    <div className="flex flex-col text-[#505050]">
                        <h1 className="text-[24px] font-bold text-center">
                            {modal.action === "add" && "Добавить запись"}
                            {modal.action === "edit" && "Редактировать запись"}
                            {modal.action === "delete" && `Удалить запись?`}
                        </h1>

                        <form onSubmit={handleSubmitModalForm} className="pt-[40px] w-full">
                            {modal.action !== "delete" ? (
                                <div>
                                    <div className="grid grid-cols-2 gap-[30px] gap-x-[60px]">

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
                                            inputValue={projectSearchName}
                                            onInputChange={(event, newInputValue) => {
                                                if (newInputValue === '') {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            project: ''
                                                        }
                                                    })
                                                    setProjectSearchName(newInputValue)
                                                } else {
                                                    setProjectSearchName(newInputValue)
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
                                            <InputLabel>Задачи</InputLabel>
                                            <Select
                                                autoWidth={true}
                                                style={{
                                                    borderRadius: '50px',
                                                    minWidth: '120px',
                                                    backgroundColor: "white"
                                                }}
                                                label="Задачи"
                                                value={modal.values.task}
                                                onChange={(event: any) => {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            task: event.target.value,
                                                        },
                                                    });
                                                }}
                                            >
                                                <MenuItem value=""><em>None</em></MenuItem>
                                                {!taskList.loading && !taskList.error &&
                                                    taskList.result?.data.map((task: any, index: number) => (
                                                        <MenuItem key={index}
                                                                  value={task.id}>{task.task}</MenuItem>
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

                                        <TextField
                                            variant={"outlined"}
                                            type="text"
                                            helperText={modal.validation.message.time}
                                            error={modal.validation.error.time}
                                            label="Время(ч)"
                                            value={modal.values.time}
                                            onChange={(event: any) => {
                                                setModal({
                                                    ...modal,
                                                    values: {
                                                        ...modal.values,
                                                        time: CheckForPositiveNumbers(event.target.value) > 24 ? 24 : CheckForPositiveNumbers(event.target.value),
                                                    },
                                                });
                                            }}
                                            InputProps={{
                                                sx: {borderRadius: '50px', backgroundColor: 'white'}
                                            }}
                                        />
                                    </div>

                                    <div className="mt-[30px] h-[139px] w-full">
                                                <textarea
                                                    placeholder="Комментарий"
                                                    onChange={(event: any) => {
                                                        setModal({
                                                            ...modal,
                                                            values: {
                                                                ...modal.values,
                                                                comment: event.target.value,
                                                            },
                                                        });
                                                    }} value={modal.values.comment}
                                                    className="shadow-blog-2 outline-none rounded-[20px] p-4 w-full text-[12px] resize-none border-[1px] border-gray-300 rounded-[20px]"
                                                    id="w3review" name="w3review" rows={4} cols={20}></textarea>
                                    </div>
                                </div>
                            ) : (
                                ""
                            )}

                            <div className="flex justify-center w-full mt-[50px]">
                                <button
                                    type="submit"
                                    className={`outline-none text-[12px] py-[14px] px-[14px] bg-[#4E54E1] text-white rounded-[100px] w-[259px] ${isLoading ? "cursor-not-allowed opacity-50" : ""}}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
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
                                        </div>
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

