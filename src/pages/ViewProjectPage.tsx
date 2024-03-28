import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {ProjectsService} from "../service/ProjectsService";
import "react-quill/dist/quill.snow.css"
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import {Autocomplete, Checkbox, Pagination, Skeleton, TextField} from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
// import {TasksService} from "../service/TasksService";
import {CheckForPositiveNumbers, CustomPageSizeInput, DetailedViewTable} from "../helpers/helpers";


const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

const workStepInitialValue = {
    id: '',
    name: '',
    done: false,
};
const tableInitialValues = {
    rows: [],
    status: {
        loading: false,
        error: false,
        message: "",
    },
    filter: {
        size: 20,
        page: 1,
        total_pages: 1,
    },
}
export default function ViewProjectPage() {
    const {id} = useParams();
    const project = ProjectsService.GetProjectByAsyncHook(typeof id !== 'undefined' ? id : '');
    const [participantSearchName, setParticipantSearchName] = useState('');
    const [participants, setParticipants] = useState<any>([]);
    const [participantsTemp, setParticipantsTemp] = useState<any>([]);
    const participantsList = ProjectsService.GetProjectParticipantsListBySearch({
        search: participantSearchName,
        project: id
    });
    const [workSteps, setWorkSteps] = useState<any>([]);
    const [workStep, setWorkStep] = useState<any>(workStepInitialValue);

    const handleAddParticipant = () => {
        if (participantsTemp.length > 0) {
            ProjectsService.CreateParticipants({
                participants: participantsTemp.map((participant: any) => participant.id),
                project: id,
            }).then(() => {
                setParticipants([...participants, ...participantsTemp]);
                setParticipantsTemp([]);
            });
        }
    };

    const handleDeleteParticipant = (participant_id: any, index: any) => {
        ProjectsService.DeleteParticipants({
            participant: participant_id,
            project: id,
        }).then(() => {
            const participantsArr = participants;
            const newArray = [...participantsArr.slice(0, index), ...participantsArr.slice(index + 1)];
            setParticipants(newArray);
        });
    };

    const handleAddWorkStep = () => {
        ProjectsService.CreateWorkStep({
            ...workStep,
            project: id,
        }).then((res) => {
            setWorkSteps([...workSteps, {...workStep, id: res.data.id}]);
            setWorkStep(workStepInitialValue);
        });
    };

    const handleDeleteWorkStep = (workStepId: any, index: any) => {
        ProjectsService.DeleteWorkStep(workStepId)
            .then(() => {
                const updatedWorkSteps = [...workSteps];
                updatedWorkSteps.splice(index, 1);
                setWorkSteps(updatedWorkSteps);
            })
            .catch((error) => {
                console.error('Error deleting work step:', error);
            });
    };

    const handleUpdateWorkStep = (e: any, type: any, index: any) => {
        if (type === 'check') {
            const updatedWorkSteps = workSteps.map((step: any, stepIndex: any) => {
                if (stepIndex === index) {
                    return {...step, done: e.target.checked};
                }
                return step;
            });

            setWorkSteps(updatedWorkSteps);

            ProjectsService.UpdateWorkStep({
                done: e.target.checked,
                project: id,
            }, workSteps[index].id)
                .then(() => {
                    // Handle the success or errors of the update if needed
                });
        } else {
            const updatedWorkSteps = workSteps.map((step: any, stepIndex: any) => {
                if (stepIndex === index) {
                    return {...step, name: e.target.value};
                }
                return step;
            });

            setWorkSteps(updatedWorkSteps);

            ProjectsService.UpdateWorkStep({
                name: e.target.value,
                project: id,
            }, workSteps[index].id)
                .then(() => {
                    // Handle the success or errors of the update if needed
                });
        }
    };

    useEffect(() => {
        if (!project.loading && !project.error) {
            const data = project.result?.data;
            setParticipants(data.participants.map((participant: any) => ({
                id: participant.id,
                name: `${participant.firstname} ${participant.lastname}`,
            })));
            setWorkSteps(data.work_steps.map((workStep: any) => ({
                id: workStep.id,
                name: `${workStep.name}`,
                done: workStep.done,
            })));
        }
    }, [project.loading, project.error, project.result?.data]);


    const [table, setTable] = useState({
        ...tableInitialValues,
        columns: [
            {field: "id", headerName: "id", width: "120px", hide: true},
            {field: "name", headerName: "Название", width: "120px", hide: false},
            {
                field: "client",
                headerName: "Клиент",
                width: "120px",
                hide: false,
                renderCell: (params: any) => params.client?.name
            },
            {
                field: "status",
                headerName: "Статус",
                width: "120px",
                hide: false,
                renderCell: (params: any) => params.status?.name
            },
            {field: "start_at", headerName: "Дата начала", width: "120px", hide: false,},
            {field: "end_at", headerName: "Дата окончания", width: "120px", hide: false,},
            {field: "cost", headerName: "Сумма", width: "120px", hide: false,},
            {
                field: "terms_of_reference",
                headerName: "Техническое задание",
                width: "120px",
                hide: false,
                renderCell: (params: any) => (
                    <div className='cursor-pointer ' onClick={() => {
                        window.open(params.terms_of_reference)
                    }}>
                        <img src="" alt="docx"/>
                    </div>
                )
            },
            {
                field: "agreement", headerName: "Договор", width: "120px", hide: false, renderCell: (params: any) => (
                    <div className='cursor-pointer ' onClick={() => {
                        window.open(params.agreement)
                    }}>
                        <img src="" alt="docx"/>
                    </div>
                )
            },
        ],
        filter: {
            ...tableInitialValues.filter,
            client: id,
        },
    });

    // const tableList = TasksService.GetTaskList({project: id})
    // {/*useEffect(() => {*/}
    // {/*    if (tableList.loading) {*/}
    // {/*        setTable((prevState) => ({*/}
    //             ...prevState,
    //             status: {
    //                 ...prevState.status,
    //                 loading: true,
    //             },
    //         }));
    //     } else if (tableList.error) {
    //         setTable((prevState) => ({
    //             ...prevState,
    //             status: {
    //                 ...prevState.status,
    //                 loading: false,
    //                 error: true,
    //             },
    //         }));
    //     } else {
    //         const data = tableList.result?.data
    //         setTable((prevState) => ({
    //             ...prevState,
    //             rows: data.results,
    //             status: {
    //                 ...prevState.status,
    //                 loading: false,
    //                 error: false,
    //             },
    //             filter: {
    //                 ...prevState.filter,
    //                 page: data.current_page,
    //                 total_pages: data.total_pages,
    //             },
    //         }));
    //     }
    // }, [tableList.loading, tableList.error, tableList.result?.data]);

    return (
        <>
            <h1 className="text-[36px] font-bold mb-[63px]">Просмотр проекта</h1>

            {project.loading
                ?
                <>
                    <div className='w-full flex flex-col gap-[24px]'>
                        <Skeleton variant="rectangular" width={'100%'} height={171}/>
                        <div className='w-full flex gap-[24px]'>
                            <Skeleton variant="rectangular" width={'100%'} height={400}/>
                            <Skeleton variant="rectangular" width={'100%'} height={400}/>
                        </div>
                        <Skeleton variant="rectangular" width={'100%'} height={400}/>
                    </div>
                </>
                : project.error
                    ? 'error'
                    :
                    <div className='w-full grid grid-cols-2 gap-[24px]'>
                        <div className="w-full p-5 rounded-[10px] bg-white shadow-block col-start-1 col-end-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Название проекта
                                    </p>
                                    <p className="text-[24px] text-[#282828] font-bold">
                                        {project.result?.data.name}
                                    </p>
                                    <p className="text-[14px] text-[#4E54E1] font-bold">
                                        {project.result?.data.client?.name}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full mt-[24px] flex justify-between gap-[60px]">
                                <div
                                    className='shrink-0 w-1/2 flex flex-col justify-start items-start gap-[30px]'>
                                    <h3 className='text-[14px] font-[600] text-[#282828]'>Общая
                                        информация</h3>
                                    <div className='w-full flex justify-between items-start gap-[30px]'>
                                        <div className='flex flex-col justify-start items-start gap-[10px]'>
                                            <p className='text-[10px] font-[500] text-[#8C8C8C]'>Дата начала</p>
                                            <p className='text-[14px] font-[500] text-[#282828] h-[20px]'>{project.result?.data.start_at}</p>
                                        </div>
                                        <div className='flex flex-col justify-start items-start gap-[10px]'>
                                            <p className='text-[10px] font-[500] text-[#8C8C8C]'>Дата окончания</p>
                                            <p className='text-[14px] font-[500] text-[#282828] h-[20px]'>{project.result?.data.end_at}</p>
                                        </div>
                                        <div className='flex flex-col justify-start items-start gap-[10px]'>
                                            <p className='text-[10px] font-[500] text-[#8C8C8C]'>Сумма</p>
                                            <p className='text-[14px] font-[500] text-[#282828] h-[20px]'>{project.result?.data.cost}</p>
                                        </div>
                                        <div className='flex flex-col justify-start items-start gap-[10px]'>
                                            <p className='text-[10px] font-[500] text-[#8C8C8C]'>Статус</p>
                                            <p className='text-[14px] font-[500] text-[#282828] h-[20px]'>{project.result?.data.status?.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='w-1/2 flex flex-col justify-start items-start gap-[30px]'>
                                    <h3 className='text-[14px] font-[600] text-[#282828]'>Вложения</h3>
                                    <div className='w-full flex justify-between items-end gap-[30px]'>
                                        <div className='flex gap-[30px] items-start justify-start'>
                                            <div className='flex flex-col justify-start items-start gap-[10px]'>
                                                <span className='text-[10px] font-[500] text-[#8C8C8C]'>Техническое задание</span>
                                                {project.result?.data.terms_of_reference !== null &&
                                                    <IconButton onClick={() => {window.open(project.result?.data.terms_of_reference)}}>
                                                        <InsertDriveFileIcon/>
                                                    </IconButton>
                                                }
                                            </div>
                                            <div className='flex flex-col justify-start items-start gap-[10px]'>
                                                            <span
                                                                className='text-[10px] font-[500] text-[#8C8C8C]'>Договор</span>
                                                {project.result?.data.agreement !== null &&
                                                    <IconButton
                                                         onClick={() => {
                                                             window.open(project.result?.data.agreement)
                                                         }}>
                                                        <InsertDriveFileIcon/>
                                                    </IconButton>
                                                }
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                            }}
                                            className='text-[12px] font-[600] px-[20px] py-[10px] text-white rounded-[100px] bg-[#4E54E1]'>
                                            Подробнее
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* participants */}

                        <div className="relative w-full h-full p-5 rounded-[10px] bg-white shadow-block flex flex-col justify-start items-start gap-[50px]">
                            <h2 className="text-[16px] font-[600] text-[#282828]">Участники</h2>
                            <div className="w-full flex flex-col justify-start items-start gap-[20px] h-[250px] overflow-scroll border p-[10px]">
                                {participants.map((participant: any, index: any) => (
                                    <div
                                        className="w-full flex justify-between items-center border-b border-b-[#FAFAFA]"
                                        key={index}>
                                        <p className="text-12px font-[500] text-[#282828]">{participant.name}</p>
                                        <div className="flex gap-[10px] items-center">
                                            <div
                                                className="px-[10px] py-[6px] rounded-[100px] bg-[#FAFAFA] text-[#8C8C8C] font-[500] text-[12px]">
                                                10 часов
                                            </div>
                                            <IconButton
                                                 onClick={() => handleDeleteParticipant(participant.id, index)}>
                                                <DeleteIcon/>
                                            </IconButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={(event) => {event.preventDefault(); handleAddParticipant()}} className="w-full flex justify-start items-center gap-[10px] cursor-pointer">
                                <Autocomplete
                                    multiple
                                    options={!participantsList.loading && !participantsList.error
                                        ? [
                                            ...participantsList.result?.data.map((participant: any) => ({
                                                id: participant.id,
                                                name: `${participant.firstname} ${participant.lastname}`,
                                            })),
                                        ]
                                        : []}
                                    disableCloseOnSelect
                                    getOptionLabel={(option) => option.name}
                                    renderOption={(props, option, {selected}) => (
                                        <li {...props}>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{marginRight: 8}}
                                                checked={selected}
                                            />
                                            {option.name}
                                        </li>
                                    )}
                                    value={participantsTemp}
                                    onChange={(event, value) => {
                                        setParticipantsTemp(value)
                                    }}
                                    loading={participantsList.loading}
                                    inputValue={participantSearchName}
                                    onInputChange={(event, newInputValue) => {
                                        setParticipantSearchName(newInputValue)
                                    }}
                                    style={{width: '100%'}}
                                    renderInput={(params) => (
                                        <div>
                                            <TextField {...params} fullWidth={true} sx={{width: '100%' }} placeholder="Добавить участников" variant='standard'/>
                                        </div>
                                    )}
                                />
                                <button type='submit'
                                        className='text-[12px] font-[600] px-[20px] py-[10px] text-white rounded-[100px] bg-[#4E54E1]'
                                >
                                    Добавить
                                </button>
                            </form>
                            <div className="w-full flex justify-between items-center">
                                <p className="text-14px font-[700] text-[#282828]">Общее время</p>
                                <p className="text-14px font-[700] text-[#282828]">
                                    <span className="text-14px font-[700] text-[#4E54E1]">184</span> часа
                                </p>
                            </div>
                        </div>

                        {/* work_steps */}

                        <div
                            className="w-full h-full p-5 rounded-[10px] bg-white shadow-block flex flex-col justify-start items-start gap-[50px]">
                            <h2 className="text-[16px] font-[600] text-[#282828]">Этапы работы</h2>
                            <div
                                className="w-full flex flex-col justify-start items-start gap-[10px] h-[250px] overflow-scroll border p-[10px]">
                                {workSteps.map((item: any, index: any) => (
                                    <div className="w-full gap-[20px] flex justify-between items-center pb-[10px]"
                                         key={index}>
                                        <div className="flex items-center gap-[8px] w-full">
                                            <Checkbox
                                                key={item.id}
                                                checked={item.done}
                                                onChange={(e) => handleUpdateWorkStep(e, 'check', index)}
                                                inputProps={{'aria-label': 'controlled'}}
                                            />
                                            <TextField
                                                size='small'
                                                fullWidth={true}
                                                placeholder="Название"
                                                variant='standard'
                                                sx={{borderBottomWidth: '0'}}
                                                value={item.name}
                                                onChange={(e) => handleUpdateWorkStep(e, 'text', index)}
                                            />
                                        </div>
                                        <IconButton
                                             onClick={() => handleDeleteWorkStep(item.id, index)}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={(event) => {
                                event.preventDefault()
                                handleAddWorkStep()
                            }} className="w-full flex justify-start items-center gap-[10px] cursor-pointer">
                                <TextField fullWidth={true} placeholder="Добавить этап" variant='standard'
                                           value={workStep.name}
                                           onChange={(event) => {
                                               setWorkStep({
                                                   ...workStep,
                                                   name: event.target.value
                                               })
                                           }}
                                />
                                <button type='submit'
                                        className='text-[12px] font-[600] px-[20px] py-[10px] text-white rounded-[100px] bg-[#4E54E1]'
                                >
                                    Добавить
                                </button>
                            </form>
                            <div className="w-full flex justify-between items-center">
                                <p className="text-14px font-[700] text-[#282828]">Текущий этап</p>
                                <span className="text-14px font-[700] text-[#4E54E1]">Разработка макета</span>
                            </div>
                        </div>


                        {/* table */}
                        <div className="col-start-1 col-end-3 w-full h-full p-5 rounded-[10px] bg-white shadow-block flex flex-col justify-start items-start">
                            <h2 className='text-[16px] font-[600] text-[#282828] mb-[30px]'>Список выполненных задач</h2>


                            <DetailedViewTable
                                columns={table.columns}
                                rows={table.rows}
                                checkboxSelection={false}
                                loading={table.status.loading}
                                error={table.status.error}
                                message={table.status.message}
                                footer={
                                    <div
                                        className="w-full bg-white flex justify-between items-center p-2.5 pt-[40px] pl-[30px] pb-[20px]">
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

                        </div>

                    </div>
            }
        </>
    );
}

