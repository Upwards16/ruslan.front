import React, {useEffect, useState} from "react";
import {
    CheckForPositiveNumbers,
    CustomModal,
    CustomPageSizeInput,
    CustomTable,
    ValidateFormSubmitResponse
} from "../helpers/helpers";
import {FormControl, IconButton, InputLabel, MenuItem, Pagination, Select, TextField} from "@mui/material";
import {ProjectsService} from "../service/ProjectsService";
import {useLocation, useNavigate} from "react-router-dom";
import {CommonService} from "../service/CommonService";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import moment from "moment/moment";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ClearIcon from "@mui/icons-material/Clear";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {getCookie} from "typescript-cookie";
import {position} from "../https/axiosInstance";
import {accessRules} from "../components/MiddleWare";

const modalInitialValues = {
    open: false,
    values: {
        id: '',
        status: '',
        client: '',
        name: '',
        start_at: null,
        end_at: null,
        cost: '',
        terms_of_reference: new File([""], ''),
        agreement: new File([""], ''),
        banner: new File([""], ''),
    },
    validation: {
        error: {
            status: false,
            client: false,
            name: false,
            start_at: false,
            end_at: false,
            cost: false,
            terms_of_reference: false,
            agreement: false,
            banner: false,
        },
        message: {
            status: '',
            client: '',
            name: '',
            start_at: '',
            end_at: '',
            cost: '',
            terms_of_reference: '',
            agreement: '',
            banner: '',
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
        client: "",
        status: "",
        size: 20,
        page: 1,
        total_pages: 1,
    },
}

export default function ProjectsPage() {
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
            {field: "name", headerName: "Название", width: "120px"},
            {
                field: "client",
                headerName: "Клиент",
                width: "120px",
                renderCell: (params: any) => params.client?.name
            },
            {
                field: "status",
                headerName: "Статус",
                width: "120px",
                renderCell: (params: any) => params.status?.name
            },
            {field: "start_at", headerName: "Дата начала", width: "120px"},
            {field: "end_at", headerName: "Дата окончания", width: "120px"},
            {field: "cost", headerName: "Сумма", width: "120px"},
            {
                field: "terms_of_reference",
                headerName: "ТЗ",
                width: "120px",
                renderCell: (params: any) => params.terms_of_reference !== null &&
                    <IconButton onClick={() => {
                        window.open(params.terms_of_reference)
                    }}>
                        <InsertDriveFileIcon/>
                    </IconButton>
            },
            {
                field: "agreement",
                headerName: "Договор",
                width: "120px",
                renderCell: (params: any) => params.agreement !== null &&
                    <IconButton onClick={() => {
                        window.open(params.agreement)
                    }}>
                        <InsertDriveFileIcon/>
                    </IconButton>
            },
            {
                field: "", headerName: "", width: "0px", renderCell: (params: any) => (
                    <div className="flex gap-[20px]">
                        {pageAccessRule.edit &&
                            <IconButton onClick={() => {
                                getProject(params, 'edit')
                            }}>
                                <EditIcon/>
                            </IconButton>
                        }
                        {pageAccessRule.delete &&
                            <IconButton onClick={() => {
                                getProject(params, 'delete')
                            }}>
                                <DeleteIcon style={{color: 'red'}}/>
                            </IconButton>
                        }
                    </div>
                )
            },
        ]
    });

    const tableList = ProjectsService.GetProjectList(table.filter);
    const statusList = ProjectsService.GetProjectStatuses();
    const clientList = ProjectsService.GetProjectClients();

    const [isLoading, setIsLoading] = useState(false);
     
    const getProject = async (params: any, action: string) => {
        let agreement = new File([""], '')
        let terms_of_reference = new File([""], '')
        let banner = new File([""], '')
        if (action !== 'delete') {
            agreement = await CommonService.convertImageUrlToFile(params.agreement).catch(() => new File([""], ''));
            terms_of_reference = await CommonService.convertImageUrlToFile(params.terms_of_reference).catch(() => new File([""], ''));
            banner = await CommonService.convertImageUrlToFile(params.banner).catch(() => new File([""], ''));
        }
        setModal({
            ...modal,
            open: true,
            action: action,
            values: {
                ...modal.values,
                ...params,
                client: params.client !== null ? params.client.id : "",
                status: params.status !== null ? params.status.id : "",
                start_at: params.start_at ? dayjs(params.start_at) : null,
                end_at: params.end_at ? dayjs(params.end_at) : null,
                agreement,
                terms_of_reference,
                banner
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
            if (key === 'start_at' || key === 'end_at') {
                payload[key] = moment(payload[key]?.$d).format('YYYY-MM-DD');
            }
            if (payload[key] === '') {
                delete payload[key]
            }
        }
        switch (modal.action) {
            case "add":
                setIsLoading(true)
                ProjectsService.CreateProject(payload)
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
                ProjectsService.UpdateProject(payload)
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
                ProjectsService.DeleteProject(payload.id)
                    .then(() => {
                        tableList.execute()
                        setModal(modalInitialValues);
                    }).catch((err) => {
                    checkModalResponse(err.response.data)
                }).finally(() => {
                    setIsLoading(true)
                })
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
                <h1 className="text-[36px] font-bold">Проекты</h1>

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

            <div className="flex items-center justify-between mt-[42px]">
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

            <CustomTable
                columns={table.columns}
                rows={table.rows}
                checkboxSelection={false}
                loading={table.status.loading}
                onRowDoubleClick={(params: any) => navigate(`/projects/${params.id}`)}
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
                onClose={() => setModal({...modal, open: false})}
                children={
                    <div className="flex flex-col text-[#505050]">
                        <h1 className="text-[24px] font-bold text-center">
                            {modal.action === "add" && "Добавить проект"}
                            {modal.action === "edit" && "Изменить проект"}
                            {modal.action === "delete" && "Удалить проект?"}
                        </h1>

                        <form onSubmit={handleSubmitModalForm} className="pt-[40px] w-full">
                            {modal.action !== 'delete' &&
                                <div className="grid grid-cols-2 gap-[30px] gap-x-[60px]">

                                    <TextField
                                        variant={'outlined'}
                                        type="text"
                                        helperText={modal.validation.message.name}
                                        error={modal.validation.error.name}
                                        label="Название"
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
                                        InputProps={{sx: {backgroundColor: 'white', borderRadius: '50px'}}}
                                    />
                                    <TextField
                                        type="number"
                                        helperText={modal.validation.message.cost}
                                        error={modal.validation.error.cost}
                                        label="Сумма"
                                        value={modal.values.cost}
                                        onChange={(event: any) => {
                                            setModal({
                                                ...modal,
                                                values: {
                                                    ...modal.values,
                                                    cost: CheckForPositiveNumbers(event.target.value),
                                                },
                                            });
                                        }}
                                        InputProps={{sx: {backgroundColor: 'white', borderRadius: '50px'}}}
                                    />
                                    <DatePicker label="Дата начала"
                                                format={'YYYY-MM-DD'}
                                                slotProps={{
                                                    textField: {
                                                        InputProps: {
                                                            sx: {borderRadius: '50px', backgroundColor: 'white'},
                                                        }
                                                    },
                                                }}
                                                value={modal.values.start_at ? dayjs(modal.values.start_at) : null}
                                                onChange={(date) => {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            start_at: date ? date.format("YYYY-MM-DD") : null,
                                                        },
                                                    });
                                                }}
                                    />

                                    <DatePicker label="Дата окончания"
                                                format={'YYYY-MM-DD'}
                                                slotProps={{
                                                    textField: {
                                                        InputProps: {
                                                            sx: {borderRadius: '50px', backgroundColor: 'white'},
                                                        }
                                                    },
                                                }}
                                                value={modal.values.end_at ? dayjs(modal.values.end_at) : null}
                                                onChange={(date) => {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            end_at: date ? date.format("YYYY-MM-DD") : null,
                                                        },
                                                    });
                                                }}
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
                                            {!statusList.loading && !statusList.error &&
                                                statusList.result?.data.map((status: any, index: number) => (
                                                    <MenuItem key={index}
                                                              value={status.id}>{status.name}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <InputLabel>Клиент</InputLabel>
                                        <Select
                                            autoWidth={true}
                                            style={{
                                                borderRadius: '50px',
                                                minWidth: '120px',
                                                backgroundColor: "white"
                                            }}
                                            label="Клиент"
                                            value={modal.values.client}
                                            onChange={(event: any) => {
                                                setModal({
                                                    ...modal,
                                                    values: {
                                                        ...modal.values,
                                                        client: event.target.value,
                                                    },
                                                });
                                            }}
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {!clientList.loading && !clientList.error &&
                                                clientList.result?.data.map((client: any, index: number) => (
                                                    <MenuItem key={index}
                                                              value={client.id}>{client.name}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        variant="outlined"
                                        type="text"
                                        label="Техническое задание"
                                        value={modal.values.terms_of_reference.name}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'},
                                            endAdornment:
                                                <div>
                                                    {modal.values.terms_of_reference.name === ''
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
                                                                                   terms_of_reference: event.target.files[0]
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
                                                                    terms_of_reference: new File([''], '')
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
                                        label="Договор"
                                        value={modal.values.agreement.name}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'},
                                            endAdornment:
                                                <div>
                                                    {modal.values.agreement.name === ''
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
                                                                                   agreement: event.target.files[0]
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
                                                                    agreement: new File([''], '')
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
                                        label="Баннер"
                                        value={modal.values.banner.name}
                                        InputProps={{
                                            sx: {borderRadius: '50px', backgroundColor: 'white'},
                                            endAdornment:
                                                <div>
                                                    {modal.values.banner.name === ''
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
                                                                                   banner: event.target.files[0]
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
                                                                    banner: new File([''], '')
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
                            }
                            <div className="flex justify-center w-full mt-[50px]">
                                <button
                                    type="submit"
                                    className={`outline-none text-[12px] py-[14px] px-[14px] bg-[#4E54E1] text-white rounded-[100px] w-[259px] ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                                            </div>
                                        )
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

