import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import "react-quill/dist/quill.snow.css"
import {LeadsService} from "../service/LeadsServices";
import {IconButton, Skeleton} from "@mui/material";
import moment from "moment/moment";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';

const callInfoInitialValue = {
    id: '',
    date: '',
    comment: '',
}

export default function ViewLeadsPage() {
    const {id} = useParams()
    const lead = LeadsService.GetLeadNyAsyncHook(typeof id !== 'undefined' ? id : '')

    // call history

    const [callList, setCallList] = useState<any>([])

    const [callInfo, setCallInfo] = useState(callInfoInitialValue)

    const handleCallAdd = () => {
        if (!callList.some((obj: any) => obj.id === '')) {
            setCallList([...callList, {
                id: '',
                date: '',
                comment: '',
                edit: true,
            }])
            setCallInfo({
                id: '',
                date: '',
                comment: '',
            })
        }
    }
    const handleCallSubmit = (call: any) => {
        if (call.id === '') {
            if (callInfo.comment !== '' && callInfo.date !== '') {
                LeadsService.CreateCall({
                    ...callInfo, lead: id
                }).then((res) => {
                    setCallList((prevState: any) => prevState.map((obj: any) => ({
                        ...obj,
                        ...(obj.id === call.id ? {
                            ...callInfo,
                            id: res.data.id,
                            edit: false
                        } : {}),
                    })))
                    setCallInfo(callInfoInitialValue);
                });
            }
        } else {
            LeadsService.EditCall(callInfo).then(() => {
                setCallList((prevState: any) => prevState.map((obj: any) => ({
                    ...obj,
                    ...(obj.id === call.id ? {
                        ...callInfo,
                        edit: false
                    } : {}),
                })))
                setCallInfo(callInfoInitialValue);
            });
        }
    }
    const handleCallCancel = () => {
        setCallList((prevState: any) => prevState.filter((obj: any) => obj.id !== ''))
        setCallInfo(callInfoInitialValue)
    }
    const handleCallDelete = (call: any, index: any) => {
        LeadsService.DeleteCall(call.id).then(() => {
            const newArray = [...callList.slice(0, index), ...callList.slice(index + 1)];
            setCallList(newArray);
        });
    }
    const handleCallEdit = (call: any) => {
        setCallList((prevState: any) => prevState.map((obj: any) => ({
            ...obj,
            edit: obj.id === call.id
        })))
        setCallInfo({
            id: call.id,
            date: call.date,
            comment: call.comment,
        })
    }

    useEffect(() => {
        if (!lead.loading && !lead.error) {
            const data = lead.result?.data
            setCallList(() => data.call_history.map((call: any) => ({
                id: call.id,
                date: call.date,
                comment: call.comment,
                edit: false,
            })))
        }
    }, [lead.loading, lead.error, lead.result?.data])
    return (
        <>
            <h1 className="text-[36px] font-bold mb-[63px]">Просмотр лида</h1>

            {lead.loading
                ?
                <>
                    <div className='w-full flex flex-col gap-[24px]'>
                        <Skeleton variant="rectangular" width={'100%'} height={171}/>
                        <div className='w-full flex gap-[24px]'>
                            <Skeleton variant="rectangular" width={'100%'} height={400}/>
                            <Skeleton variant="rectangular" width={'100%'} height={400}/>
                        </div>
                    </div>
                </>
                : lead.error
                    ? 'error'
                    :
                    <div className="grid grid-cols-2 gap-[24px]">
                        <div className="p-5 rounded-[10px] bg-white shadow-block relative col-start-1 col-end-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Клиент
                                    </p>
                                    <p className="text-[24px] text-[#505050] font-bold">
                                        {lead.result?.data.full_name}
                                    </p>

                                </div>
                            </div>
                            <div className="mt-[24px] flex justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Менеджер
                                    </p>
                                    <p className="text-[16px] text-[#505050] font-bold">
                                        {lead.result?.data.user ? `${lead.result?.data.user.firstname} ${lead.result?.data.user.lastname}` : ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Дата рождения
                                    </p>
                                    <p className="text-[16px] text-[#505050] font-medium">
                                        {lead.result?.data.date}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Напоминание
                                    </p>
                                    <p className="text-[16px] text-[#505050] font-medium">
                                        {moment(lead.result?.data.reminder_date).format('DD.MM.YYYY hh:mm')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Источник
                                    </p>
                                    <p className="text-[16px] text-[#505050] font-medium">
                                        {lead.result?.data.traffic_source ? lead.result?.data.traffic_source.name : ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Статус
                                    </p>
                                    <p className="text-[16px] text-[#505050] font-medium">
                                        {lead.result?.data.status ? lead.result?.data.status.name : ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Номер
                                    </p>
                                    <p className="text-[16px] text-[#505050] font-medium">
                                        {lead.result?.data.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full h-full p-5 rounded-[10px] bg-white shadow-block flex flex-col justify-start items-start gap-[50px]">
                            <h4 className='text-[16px] text-[#505050] font-bold'>История звонков</h4>

                            <div
                                className="w-full flex flex-col justify-start items-start gap-[20px] h-[250px] overflow-scroll border p-[10px]">
                                <table className='w-full callHistory-table'>
                                    <thead>
                                    <tr>
                                        <th>
                                            <div>Дата и время</div>
                                        </th>
                                        <th>
                                            <div>Комментарий</div>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {callList.map((call: any, index: number) =>
                                        <tr key={index}>
                                            <td>
                                                <div>
                                                    {call.edit
                                                        ? <input value={callInfo.date} onChange={(event) => {
                                                            setCallInfo({...callInfo, date: event.target.value})
                                                        }} type="datetime-local" className='border-b pb-[5px]'/>
                                                        : moment(call.date).format('DD.MM.YYYY hh:mm')
                                                    }
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    {call.edit
                                                        ? <input value={callInfo.comment} onChange={(event) => {
                                                            setCallInfo({...callInfo, comment: event.target.value})
                                                        }} type="text-local"
                                                                 className='w-full border-b pb-[5px]'/>
                                                        : call.comment
                                                    }
                                                </div>
                                            </td>
                                            <td>
                                                <div className='flex gap-[20px] h-[30px]'>
                                                    {call.edit
                                                        ?
                                                        <IconButton onClick={() => handleCallSubmit(call)}>
                                                            <DoneIcon/>
                                                        </IconButton>
                                                        :
                                                        <IconButton onClick={() => handleCallEdit(call)}>
                                                            <EditIcon/>
                                                        </IconButton>
                                                    }
                                                    {call.edit
                                                        ?
                                                        <IconButton onClick={() => handleCallCancel()}>
                                                            <ClearIcon/>
                                                        </IconButton>
                                                        :
                                                        <IconButton onClick={() => handleCallDelete(call, index)}>
                                                            <DeleteIcon/>
                                                        </IconButton>
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <form onSubmit={(event) => {event.preventDefault(); handleCallAdd()}} className="w-full flex justify-start items-center gap-[10px] cursor-pointer">
                                <button type='submit'
                                        className='text-[12px] font-[600] px-[20px] py-[10px] text-white rounded-[100px] bg-[#4E54E1]'
                                >
                                    Добавить
                                </button>
                            </form>
                        </div>

                        <div className="relative w-full h-full p-5 rounded-[10px] bg-white shadow-block flex flex-col justify-start items-start gap-[50px]">
                            <h4 className='text-[16px] text-[#505050] font-bold'>Комментарий</h4>

                            <div
                                className="w-full flex flex-col justify-start items-start gap-[20px] h-[250px] overflow-scroll border p-[10px]">
                                <p className='w-full h-[228px] outline-none resize-none'>{lead.result?.data.comment}</p>
                            </div>
                        </div>
                    </div>
            }
        </>
    );
}

