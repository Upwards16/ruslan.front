import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {TasksService} from "../service/TasksService";
import {
    Avatar,
    AvatarGroup,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Skeleton,
    TextField
} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import moment from "moment";
import {CustomModal, stringAvatar, ValidateFormSubmitResponse} from "../helpers/helpers";
import AddIcon from '@mui/icons-material/Add';
import {CommonService} from "../service/CommonService";
import dayjs from "dayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ClearIcon from "@mui/icons-material/Clear";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";

export const getColorsForDeadline = (deadlineDate: Date | string) => {
    const deadline = new Date(deadlineDate);
    const today = new Date();
    const daysLeft = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return (daysLeft < 2 && daysLeft > 1) ? 'orange' : (daysLeft < 1) ? 'red' : '#4E54E1'
};

const modalInitialValues = {
    open: false,
    values: {
        id: '',
        task: '',
        deadline: null,
        description: '',
        column: '',
        mark: '',
        participants: [],
        attachment: new File([""], ''),
    },
    validation: {
        error: {
            task: false,
            deadline: false,
            description: false,
            project: false,
            column: false,
            mark: false,
            participants: false,
            attachment: false
        },
        message: {
            task: '',
            deadline: '',
            description: '',
            project: '',
            column: '',
            mark: '',
            participants: '',
            attachment: ''
        }
    },
    action: "add",
    requestIsSent: false,
};

const onDragEnd = (result: any, columns: any, setColumns: any) => {
    if (!result.destination) return;
    const {source, destination} = result
    if (source.droppableId !== destination.droppableId) {
        const sourceColumn = columns[source.droppableId]
        const destColumn = columns[destination.droppableId]
        const sourceItems = [...sourceColumn.tasks]
        const destItems = [...destColumn.tasks]
        const [removed] = sourceItems.splice(source.index, 1)
        destItems.splice(destination.index, 0, removed)
        setColumns({
            ...columns,
            [source.droppableId]: {
                ...sourceColumn,
                tasks: sourceItems
            },
            [destination.droppableId]: {
                ...destColumn,
                tasks: destItems
            }
        })
    } else {
        const column = columns[source.droppableId]
        const copiedItems = [...column.tasks]
        const [removed] = copiedItems.splice(source.index, 1)
        copiedItems.splice(destination.index, 0, removed)
        setColumns({
            ...columns,
            [source.droppableId]: {
                ...column,
                tasks: copiedItems,
            }
        })
    }

    TasksService.UpdatePosition(result)
}

export default function ViewTasksPage() {
    const {id} = useParams()
    const [taskColumns, setTaskColumns] = useState<any>({})
    const taskColumnsList = TasksService.GetTaskColumns()
    const markList = TasksService.GetTaskMarks()
    const taskParticipantsList = TasksService.GetTaskParticipants({
        project: id
    })
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        if (!taskColumnsList.loading && !taskColumnsList.error) {
            const data = taskColumnsList.result?.data
            const fetchData = async () => {
                const arrOfColumns = await data.map((column: any) => {
                    return TasksService.GetTaskList({
                        column: column.id,
                        project: id,
                    })
                        .then((res) => {
                            const tasks = res.data.results
                            return {
                                id: column.id,
                                name: column.name,
                                slug: column.slug,
                                page: res.data.current_page,
                                tasks: tasks.map((task: any) => ({...task, id: `${task.id}`}))
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                            return {
                                id: column.id,
                                name: column.name,
                                slug: column.slug,
                                page: 1,
                                tasks: []
                            }
                        });
                });

                const taskData = await Promise.all(arrOfColumns);

                setTaskColumns(taskData.reduce((o, column) => ({...o, [column.id]: column}), {}));
            };
            fetchData();
        }
    }, [taskColumnsList.loading, taskColumnsList.error, taskColumnsList.result?.data])

    //work with modal
    const [modal, setModal] = useState<any>({
        ...modalInitialValues,
        values: {...modalInitialValues.values, project: id}
    });
    const getTask = async (params: any, action: string) => {
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
                mark: params.mark !== null ? params.mark.id : "",
                column: params.column !== null ? params.column.id : "",
                project: params.project !== null ? params.project.id : "",
                participants: params.participants.map((participant: any) => participant.id),
                deadline: params.deadline ? dayjs(params.deadline) : null,
                attachment,
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
            if (key === 'deadline') {
                payload[key] = moment(payload[key]?.$d).format('YYYY-MM-DD');
            }
            if (payload[key] === '') {
                delete payload[key]
            }
        }
        switch (modal.action) {
            case "add":
                setIsLoading(true)
                TasksService.CreateTask(payload)
                    .then(() => {
                        taskColumnsList.execute()
                        setModal(modalInitialValues);
                    }).catch((err) => {
                    checkModalResponse(err.response.data)
                }).finally(() => {
                    setIsLoading(false)
                })
                break;

            case "edit":
                setIsLoading(true)
                TasksService.UpdateTask(payload)
                    .then(() => {
                        taskColumnsList.execute()
                        setModal(modalInitialValues);
                    }).catch((err) => {
                    checkModalResponse(err.response.data)
                }).finally(() => {
                    setIsLoading(false)
                })
                break;

            case "delete":
                setIsLoading(true)
                TasksService.DeleteTask(payload.id)
                    .then(() => {
                        taskColumnsList.execute()
                        setModal(modalInitialValues);
                    }).catch((err) => {
                    checkModalResponse(err.response.data)
                }).finally(() => {
                    setIsLoading(false)
                })
                break;
        }
    };

    return (
        <>
            <h1 className="text-[36px] font-bold mb-[23px]">Задачи</h1>
            {
                taskColumnsList.loading
                    ?
                    <div className='w-full flex justify-start items-start gap-[20px] overflow-x-scroll py-[40px]'>
                        <Skeleton variant="rectangular" style={{flexShrink: 0}} width={292} height={500}/>
                        <Skeleton variant="rectangular" style={{flexShrink: 0}} width={292} height={500}/>
                        <Skeleton variant="rectangular" style={{flexShrink: 0}} width={292} height={500}/>
                        <Skeleton variant="rectangular" style={{flexShrink: 0}} width={292} height={500}/>
                    </div>
                    : taskColumnsList.error
                        ? 'error'
                        :
                        <div className='w-full flex justify-start items-start gap-[20px] overflow-x-scroll py-[40px]'>
                            <div className='w-full h-full flex justify-start items-start gap-[30px]'>
                                <DragDropContext onDragEnd={result => onDragEnd(result, taskColumns, setTaskColumns)}>
                                    {Object.entries(taskColumns).map(([columnId, column]: [string, any]) => {
                                        return (
                                            <div key={columnId}
                                                 className='w-[292px] flex-shrink-0 flex flex-col justify-start items-start gap-[20px] bg-white rounded-[10px] shadow-lg'>
                                                <h3 className='text-[16px] font-[700] p-[20px]'>{column.name}</h3>
                                                <div className='w-full'>
                                                    <Droppable droppableId={columnId} key={columnId}>
                                                        {(provided, snapshot) => {
                                                            return (
                                                                <div {...provided.droppableProps}
                                                                     ref={provided.innerRef}
                                                                     className={`w-full min-h-[300px] max-h-[900px] flex flex-col gap-[20px] p-[20px]`}
                                                                    // style={{
                                                                    //     backgroundColor: snapshot.isDraggingOver ? 'lightblue' : 'lightgray'
                                                                    // }}
                                                                >
                                                                    {column.tasks.map((task: any, index: any) => {
                                                                            return (
                                                                                <Draggable key={task.id}
                                                                                           draggableId={task.id}
                                                                                           index={index}>
                                                                                    {(provided, snapshot) => {
                                                                                        return (
                                                                                            <div ref={provided.innerRef}
                                                                                                 {...provided.draggableProps}
                                                                                                 {...provided.dragHandleProps}
                                                                                                 className={`cursor-pointer bg-white p-[10px] w-full flex flex-col gap-[14px] shadow-md rounded-[10px] relative overflow-hidden`}
                                                                                                 onClick={(event) => {
                                                                                                     event.preventDefault();
                                                                                                     getTask(task, 'view')
                                                                                                 }}

                                                                                                 style={{
                                                                                                     userSelect: 'none',
                                                                                                     // padding: 16,
                                                                                                     // margin: '0 0 8px 0',
                                                                                                     // minHeight: '50px',
                                                                                                     // backgroundColor: snapshot.isDragging ? '#263B4A' : '#456C86',
                                                                                                     // color: "white",
                                                                                                     ...provided.draggableProps.style
                                                                                                 }}
                                                                                            >
                                                                                                <div
                                                                                                    style={{backgroundColor: task.mark?.color}}
                                                                                                    className='w-full absolute top-0 left-0 h-[2px]'></div>
                                                                                                <div
                                                                                                    className='w-full flex justify-between items-start gap-[20px]'>
                                                                                                    <p className='text-[12px] font-[500]'>{task.task}</p>
                                                                                                    <div
                                                                                                        className='flex items-center gap-[5px]'>
                                                                                                        <IconButton
                                                                                                            aria-label="more"
                                                                                                            aria-haspopup="true"
                                                                                                            onClick={(event) => {
                                                                                                                event.stopPropagation()
                                                                                                                getTask(task, 'edit')
                                                                                                            }}
                                                                                                            size={'small'}
                                                                                                        >
                                                                                                            <EditIcon
                                                                                                                style={{
                                                                                                                    width: '14px',
                                                                                                                    height: '14px'
                                                                                                                }}/>
                                                                                                        </IconButton>
                                                                                                        <IconButton
                                                                                                            aria-label="more"
                                                                                                            aria-haspopup="true"
                                                                                                            onClick={(event) => {
                                                                                                                event.stopPropagation()
                                                                                                                getTask(task, 'delete')
                                                                                                            }}
                                                                                                            size={'small'}
                                                                                                        >
                                                                                                            <DeleteIcon
                                                                                                                style={{
                                                                                                                    width: '14px',
                                                                                                                    height: '14px'
                                                                                                                }}/>
                                                                                                        </IconButton>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className='w-full flex justify-between items-end'>
                                                                                                    <div
                                                                                                        className='flex px-[4px] py-[2px] items-center rounded-[4px] bg-[#4e54e10f] gap-[6px]'>
                                                                                                        <AccessTimeIcon style={{
                                                                                                            width: '14px',
                                                                                                            height: '14px',
                                                                                                            color: getColorsForDeadline(task.deadline)
                                                                                                        }}/>
                                                                                                        <p className='text-[10px] font-[400]'
                                                                                                           style={{color: getColorsForDeadline(task.deadline)}}>
                                                                                                            {moment(task.deadline).format("MMM Do YY")}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                    <AvatarGroup max={4}>
                                                                                                        {task.participants.map((participant: any, index: number) => (
                                                                                                            <Avatar
                                                                                                                key={index} {...stringAvatar(`${participant.firstname} ${participant.lastname}`, {
                                                                                                                width: '27px',
                                                                                                                height: '27px',
                                                                                                                fontSize: '10px'
                                                                                                            })} />
                                                                                                        ))}
                                                                                                    </AvatarGroup>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    }}
                                                                                </Draggable>
                                                                            )
                                                                        }
                                                                    )}
                                                                    {provided.placeholder}
                                                                </div>
                                                            )
                                                        }}
                                                    </Droppable>
                                                </div>

                                                <Button onClick={() => {
                                                    setModal({
                                                        ...modal,
                                                        open: true,
                                                        values: {
                                                            ...modalInitialValues.values,
                                                            column: columnId,
                                                            project: id
                                                        },
                                                        action: "add",
                                                    });
                                                }} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '20px'
                                                }}>
                                                    <AddIcon/>
                                                    <p className='text-[12px] font-[700] text-[#4E54E1]'>
                                                        Добавить задачу
                                                    </p>
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </DragDropContext>
                            </div>
                        </div>
            }


            <CustomModal
                open={modal.open}
                onClose={() => setModal({...modal, open: false})}
                children={
                    <div className="flex flex-col text-[#505050]">
                        <h1 className="text-[24px] font-bold text-center">
                            {modal.action === "add" && "Добавить задачу"}
                            {modal.action === "edit" && "Изменить задачу"}
                            {modal.action === "delete" && "Удалить задачу?"}
                            {modal.action === "view" && modal.values.task}
                        </h1>
                        {modal.action !== 'view'
                            ?
                            <form onSubmit={handleSubmitModalForm} className="pt-[40px] w-full">
                                {modal.action !== 'delete' &&
                                    <div className="grid grid-cols-2 gap-[30px] gap-x-[60px]">

                                        <TextField
                                            variant={'outlined'}
                                            type="text"
                                            helperText={modal.validation.message.task}
                                            error={modal.validation.error.task}
                                            label="Задача"
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
                                            InputProps={{sx: {backgroundColor: 'white', borderRadius: '50px'}}}
                                        />

                                        <FormControl>
                                            <InputLabel>Метка</InputLabel>
                                            <Select
                                                autoWidth={true}
                                                style={{
                                                    borderRadius: '50px',
                                                    minWidth: '120px',
                                                    backgroundColor: "white"
                                                }}
                                                label="Метка"
                                                value={modal.values.mark}
                                                onChange={(event: any) => {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            mark: event.target.value,
                                                        },
                                                    });
                                                }}
                                            >
                                                <MenuItem value=""><em>None</em></MenuItem>
                                                {!markList.loading && !markList.error &&
                                                    markList.result?.data.map((mark: any, index: number) => (
                                                        <MenuItem key={index}
                                                                  value={mark.id}>{mark.name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>

                                        <DatePicker label="Дедлайн"
                                                    format={'YYYY-MM-DD'}
                                                    slotProps={{
                                                        textField: {
                                                            InputProps: {
                                                                sx: {borderRadius: '50px', backgroundColor: 'white'},
                                                            }
                                                        },
                                                    }}
                                            // value={modal.values.deadline}
                                                    value={modal.values.deadline ? dayjs(modal.values.deadline) : null}

                                                    onChange={(date) => {
                                                        setModal({
                                                            ...modal,
                                                            values: {
                                                                ...modal.values,
                                                                // deadline: date ? date : dayjs(),
                                                                deadline: date ? date.format('YYYY-MM-DD') : null,
                                                            },
                                                        });
                                                    }}
                                        />

                                        <FormControl>
                                            <InputLabel>Участники</InputLabel>
                                            <Select
                                                autoWidth={true}
                                                style={{
                                                    borderRadius: '50px',
                                                    minWidth: '120px',
                                                    backgroundColor: "white"
                                                }}
                                                multiple={true}
                                                label="Участники"
                                                value={modal.values.participants}
                                                onChange={(event: any) => {
                                                    setModal({
                                                        ...modal,
                                                        values: {
                                                            ...modal.values,
                                                            participants: event.target.value,
                                                        },
                                                    });
                                                }}
                                            >
                                                <MenuItem value=""><em>None</em></MenuItem>
                                                {!taskParticipantsList.loading && !taskParticipantsList.error &&
                                                    taskParticipantsList.result?.data.map((participant: any, index: number) => (
                                                        <MenuItem key={index}
                                                                  value={participant.id}>{participant.firstname} {participant.lastname}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>

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

                                        <div className="h-[139px] w-full col-start-1 col-end-3">
                                                <textarea
                                                    placeholder="Описание задачи"
                                                    onChange={(event: any) => {
                                                        setModal({
                                                            ...modal,
                                                            values: {
                                                                ...modal.values,
                                                                description: event.target.value,
                                                            },
                                                        });
                                                    }} value={modal.values.description}
                                                    className="shadow-blog-2 outline-none rounded-[20px] p-4 w-full text-[12px] resize-none border-[1px] border-gray-300 rounded-[20px]"
                                                    id="w3review" name="w3review" rows={4} cols={20}></textarea>
                                        </div>

                                    </div>
                                }
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
                            :
                            <div className={'pt-[40px] w-full flex flex-col gap-[30px]'}>
                                <div className='w-full flex items-center gap-[20px]'>
                                    <div
                                        className='py-[2px] px-[10px] rounded-[4px] bg-[#FAFAFA] text-[10px] font-[500]'>
                                        {taskColumns[modal.values.column]?.name}
                                    </div>
                                    <div
                                        className='flex px-[4px] py-[2px] items-center rounded-[4px] bg-[#4e54e10f] gap-[6px]'>
                                        <AccessTimeIcon style={{
                                            width: '14px',
                                            height: '14px',
                                            color: getColorsForDeadline(modal.values.deadline)
                                        }}/>
                                        <p className='text-[10px] font-[400]'
                                           style={{color: getColorsForDeadline(modal.values.deadline)}}>
                                            {moment(modal.values.deadline).format("MMM Do YY")}
                                        </p>
                                    </div>
                                    <button
                                        className='py-[6px] px-[10px] rounded-[100px] text-[10px] text-white font-[500] bg-[#4E54E1]'
                                        onClick={() => {

                                        }}
                                    >
                                        Заполнить Time Sheets
                                    </button>
                                </div>
                                <div className='w-full flex items-start justify-start gap-[60px]'>
                                    <div className='flex flex-col justify-start items-start gap-[14px]'>
                                        <p className='text-[12px] font-[600]'>Участники:</p>
                                        <AvatarGroup max={4}>
                                            {
                                                taskColumns[modal.values.column]?.tasks.find((task: any) => task.id === modal.values.id).participants.map((participant: any, participantIndex: number) => (
                                                    <Avatar
                                                        key={participantIndex} {...stringAvatar(`${participant.firstname} ${participant.lastname}`, {
                                                        width: '27px',
                                                        height: '27px',
                                                        fontSize: '10px'
                                                    })} />
                                                ))
                                            }
                                        </AvatarGroup>
                                    </div>
                                    <div className='flex flex-col justify-start items-start gap-[14px]'>
                                        <p className='text-[12px] font-[600]'>Метка:</p>
                                        <div className='flex items-center gap-[10px] h-[30px]'>
                                            <p className='text-[10px] font-[500]'>
                                                {taskColumns[modal.values.column]?.tasks.find((task: any) => task.id === modal.values.id).mark?.name}
                                            </p>
                                            <div className='w-[8px] h-[8px] rounded-[50%]'
                                                 style={{backgroundColor: taskColumns[modal.values.column]?.tasks.find((task: any) => task.id === modal.values.id).mark?.color}}>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex flex-col justify-start items-start gap-[14px]'>
                                        <p className='text-[12px] font-[600]'>Вложения:</p>
                                        <IconButton
                                            size={'small'}
                                            onClick={() => {
                                                window.open(taskColumns[modal.values.column]?.tasks.find((task: any) => task.id === modal.values.id).attachment)
                                            }}
                                        >
                                            <CloudDownloadIcon/>
                                        </IconButton>
                                    </div>
                                </div>
                                <div className='w-full flex flex-col justify-start items-start gap-[14px]'>
                                    <h3 className='text-[12px] font-[600]'>Описание</h3>
                                    <p className='text-[12px] font-[600] text-[#505050]'>
                                        {taskColumns[modal.values.column]?.tasks.find((task: any) => task.id === modal.values.id).description}
                                    </p>
                                </div>
                            </div>
                        }
                    </div>
                }
            />


        </>
    );
};

