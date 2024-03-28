import React, {useEffect, useState} from "react";
import {CheckForPositiveNumbers, CustomPageSizeInput, DetailedViewTable} from '../helpers/helpers';
import {useParams} from "react-router-dom";
import {ClientsService} from "../service/ClientsService";
import {Pagination, Skeleton} from "@mui/material";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import IconButton from "@mui/material/IconButton";

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

export default function ViewClientPage() {
    const {id} = useParams()

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
                    <IconButton onClick={() => {
                        window.open(params.terms_of_reference)
                    }}>
                        <InsertDriveFileIcon/>
                    </IconButton>
                )
            },
            {
                field: "agreement", headerName: "Договор", width: "120px", hide: false, renderCell: (params: any) => (
                    <IconButton onClick={() => {
                        window.open(params.agreement)
                    }}>
                        <InsertDriveFileIcon/>
                    </IconButton>
                )
            },
        ],
        filter: {
            ...tableInitialValues.filter,
            client: id,
        },
    });

    const client = ClientsService.GetClientByAsyncHook(typeof id !== 'undefined' ? id : '')

    const tableList = ClientsService.GetClientProjectList(table.filter);

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
            <h1 className="text-[36px] font-bold mb-[63px]">Просмотр клиента</h1>

            {client.loading
                ?
                <>
                    <div className='w-full flex flex-col gap-[24px]'>
                        <Skeleton variant="rectangular" width={'100%'} height={171}/>
                        <Skeleton variant="rectangular" width={'100%'} height={400}/>
                    </div>
                </>
                : client.error
                    ? 'error'
                    :
                    <div className='grid grid-cols-1 gap-[24px]'>
                        <div className="p-5 rounded-[10px] bg-white shadow-block">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Клиент
                                    </p>
                                    <h2 className="text-[24px] text-[#4E54E1] font-bold">
                                        {client.result?.data.name}
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-[24px] flex justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Менеджер
                                    </p>
                                    <h2 className="text-[16px] text-[#505050] font-bold">
                                        {client.result?.data.manager?.fullname}
                                    </h2>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Дата рождения
                                    </p>
                                    <h2 className="text-[16px] text-[#505050] font-medium">
                                        {client.result?.data.birthday}
                                    </h2>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Почта
                                    </p>
                                    <h2 className="text-[16px] text-[#505050] font-medium">
                                        <h2 className="text-[16px] text-[#505050] font-medium">
                                            {client.result?.data.email}
                                        </h2>
                                    </h2>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Номер
                                    </p>
                                    <h2 className="text-[16px] text-[#505050] font-medium">
                                        <h2 className="text-[16px] text-[#505050] font-medium">
                                            {client.result?.data.phone}
                                        </h2>
                                    </h2>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#8C8C8C]">
                                        Источник
                                    </p>
                                    <h2 className="text-[16px] text-[#505050] font-medium">
                                        <h2 className="text-[16px] text-[#505050] font-medium">
                                            {client.result?.data.traffic_source?.name}
                                        </h2>
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* table */}
                        <div
                            className="col-start-1 col-end-3 w-full h-full p-5 rounded-[10px] bg-white shadow-block flex flex-col justify-start items-start">
                            <h2 className='text-[16px] font-[600] text-[#282828] mb-[30px]'>Проекты</h2>


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

