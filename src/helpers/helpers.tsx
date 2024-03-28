import {createSearchParams} from "react-router-dom";
import React, {useEffect, useState} from "react";

export function CreateCleanSearchParams(params: any) {
    const newSearchObj = {...params};
    const keys = Object.keys(newSearchObj);
    for (let i = 0; i < keys.length; i++) {
        if (newSearchObj[keys[i]] === "") {
            delete newSearchObj[keys[i]];
        }
    }
    const emptyOrder = !Object.keys(newSearchObj).length;
    return emptyOrder ? "" : `?${createSearchParams(newSearchObj)}`;
}

export function CustomModal({children, onClose, open}: any) {
    return (
        <>
            {open ? (
                <div
                    className="modal fixed top-0 left-0 w-full h-full flex justify-center items-center z-[999] blur-bg p-6"
                    onClick={onClose}
                >
                    <div
                        className="bg-white rounded-[10px] px-[70px] z-10 max-h-full overflow-y-auto py-[60px] max-w-[688px] w-full"
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        {children}
                    </div>
                </div>
            ) : (
                ""
            )}
        </>
    );
}

export function CustomTable({selectedRowsId, footer, rows, columns, checkboxSelection, onSelectionModelChange, isRowSelectDisabled, multipleSelect, loading, onRowDoubleClick, onClick, onSelectAll, error, message,}: any) {
    const [selectedOrdersId, setSelectedOrdersId] = useState(
        selectedRowsId || []
    );

    useEffect(() => {
        setSelectedOrdersId(selectedRowsId || []);
    }, [selectedRowsId]);

    const [selectAllChecked, setSelectAllChecked] = useState(false);

    useEffect(() => {
        if (rows && rows.length > 0) {
            const allIdsPresent = rows.every((row: any) =>
                selectedOrdersId.includes(row.id)
            );
            setSelectAllChecked(allIdsPresent);
        }
    }, [rows, selectedOrdersId]);

    const toggleSelectAll = () => {
        if (selectAllChecked) {
            if (onSelectionModelChange) {
                // Удалить элементы из selectedOrdersId, которые есть в текущем rows
                const newSelected = selectedOrdersId.filter(
                    (id: any) => !rows.some((row: any) => row.id === id)
                );
                onSelectionModelChange(newSelected);
            }
        } else {
            // Пропустить те элементы, которые уже выбраны
            const newSelected = rows
                .filter((row: any) => !selectedOrdersId.includes(row.id))
                .filter((row: any) => (onSelectAll ? onSelectAll(row) : true))
                .map((row: any) => row.id);
            if (onSelectionModelChange) {
                onSelectionModelChange([...selectedOrdersId, ...newSelected]);
            }
        }
    };

    const checkIfChecked = (event: any, value: any) => {
        if (event.currentTarget.checked) {
            let arr = [...selectedOrdersId];
            if (!arr.includes(value)) {
                arr.push(value);
            }
            if (onSelectionModelChange) {
                onSelectionModelChange([...arr]);
            }
        } else {
            const arr = selectedOrdersId.filter((id: any) => id !== value);
            if (onSelectionModelChange) {
                onSelectionModelChange([...arr]);
            }
        }
    };

    return (
        <div className="page_tableBox mt-[25px]">
            <div className="page_table">
                <table>
                    <thead>
                    <tr>
                        {checkboxSelection && (
                            <th style={{width: "50px"}}>
                                {(typeof multipleSelect === "undefined" ||
                                    multipleSelect) && (
                                    <input
                                        id="tableAllSelect"
                                        type="checkbox"
                                        checked={selectAllChecked}
                                        onChange={toggleSelectAll}
                                    />
                                )}
                            </th>
                        )}
                        {columns?.map(
                            (column: any, i: number) =>
                                !column.hide && (
                                    <th
                                        style={{width: column.width, maxWidth: column.maxWidth}}
                                        key={i}
                                    >
                                        {column.headerName}
                                    </th>
                                )
                        )}
                    </tr>
                    </thead>
                    <tbody
                        className={`${
                            loading
                                ? "page-table__body_loader"
                                : error
                                    ? "page-table__error"
                                    : typeof rows !== "undefined" && rows?.length < 1
                                        ? "page-table__emptyData"
                                        : ""
                        }`}
                        data-message={message}
                    >
                    {rows?.map((row: any, i: number) => (
                        <tr
                            key={i}
                            onDoubleClick={() => {
                                if (onRowDoubleClick) {
                                    onRowDoubleClick(row);
                                }
                            }}
                            onClick={() => {
                                if (onClick) {
                                    onClick(row);
                                }
                            }}
                        >
                            {checkboxSelection && (
                                <td>
                                    <input
                                        disabled={
                                            isRowSelectDisabled ? isRowSelectDisabled(row) : false
                                        }
                                        type="checkbox"
                                        checked={selectedOrdersId.includes(row.id)}
                                        onChange={(event) => checkIfChecked(event, row.id)}
                                    />
                                </td>
                            )}
                            {columns?.map(
                                (column: any, i: number) =>
                                    !column.hide && (
                                        <td
                                            className="cursor-pointer"
                                            style={{
                                                width: column.width,
                                                maxWidth: column.maxWidth,
                                            }}
                                            key={i}
                                        >
                                            {column.renderCell
                                                ? column.renderCell(row)
                                                : row[column.field]}
                                        </td>
                                    )
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {footer}
        </div>
    );
}

export function DetailedViewTable({selectedRowsId, footer, rows, columns, checkboxSelection, onSelectionModelChange, isRowSelectDisabled, multipleSelect, loading, onRowDoubleClick, onClick, onSelectAll, error, message,}: any) {
    const [selectedOrdersId, setSelectedOrdersId] = useState(
        selectedRowsId || []
    );

    useEffect(() => {
        setSelectedOrdersId(selectedRowsId || []);
    }, [selectedRowsId]);

    const [selectAllChecked, setSelectAllChecked] = useState(false);

    useEffect(() => {
        if (rows && rows.length > 0) {
            const allIdsPresent = rows.every((row: any) =>
                selectedOrdersId.includes(row.id)
            );
            setSelectAllChecked(allIdsPresent);
        }
    }, [rows, selectedOrdersId]);

    const toggleSelectAll = () => {
        if (selectAllChecked) {
            if (onSelectionModelChange) {
                // Удалить элементы из selectedOrdersId, которые есть в текущем rows
                const newSelected = selectedOrdersId.filter(
                    (id: any) => !rows.some((row: any) => row.id === id)
                );
                onSelectionModelChange(newSelected);
            }
        } else {
            // Пропустить те элементы, которые уже выбраны
            const newSelected = rows
                .filter((row: any) => !selectedOrdersId.includes(row.id))
                .filter((row: any) => (onSelectAll ? onSelectAll(row) : true))
                .map((row: any) => row.id);
            if (onSelectionModelChange) {
                onSelectionModelChange([...selectedOrdersId, ...newSelected]);
            }
        }
    };

    const checkIfChecked = (event: any, value: any) => {
        if (event.currentTarget.checked) {
            let arr = [...selectedOrdersId];
            if (!arr.includes(value)) {
                arr.push(value);
            }
            if (onSelectionModelChange) {
                onSelectionModelChange([...arr]);
            }
        } else {
            const arr = selectedOrdersId.filter((id: any) => id !== value);
            if (onSelectionModelChange) {
                onSelectionModelChange([...arr]);
            }
        }
    };

    return (
        <>
            <div className="projectsTable">
                <table>
                    <thead>
                    <tr>
                        {checkboxSelection && (
                            <th style={{width: "50px"}}>
                                {(typeof multipleSelect === "undefined" ||
                                    multipleSelect) && (
                                    <input
                                        id="tableAllSelect"
                                        type="checkbox"
                                        checked={selectAllChecked}
                                        onChange={toggleSelectAll}
                                    />
                                )}
                            </th>
                        )}
                        {columns?.map(
                            (column: any, i: number) =>
                                !column.hide && (
                                    <th
                                        style={{width: column.width, maxWidth: column.maxWidth}}
                                        key={i}
                                    >
                                        {column.headerName}
                                    </th>
                                )
                        )}
                    </tr>
                    </thead>
                    <tbody
                        className={`${
                            loading
                                ? "page-table__body_loader"
                                : error
                                    ? "page-table__error"
                                    : typeof rows !== "undefined" && rows?.length < 1
                                        ? "page-table__emptyData"
                                        : ""
                        }`}
                        data-message={message}
                    >
                    {rows?.map((row: any, i: number) => (
                        <tr
                            key={i}
                            onDoubleClick={() => {
                                if (onRowDoubleClick) {
                                    onRowDoubleClick(row);
                                }
                            }}
                            onClick={() => {
                                if (onClick) {
                                    onClick(row);
                                }
                            }}
                        >
                            {checkboxSelection && (
                                <td>
                                    <input
                                        disabled={
                                            isRowSelectDisabled ? isRowSelectDisabled(row) : false
                                        }
                                        type="checkbox"
                                        checked={selectedOrdersId.includes(row.id)}
                                        onChange={(event) => checkIfChecked(event, row.id)}
                                    />
                                </td>
                            )}
                            {columns?.map(
                                (column: any, i: number) =>
                                    !column.hide && (
                                        <td
                                            style={{
                                                width: column.width,
                                                maxWidth: column.maxWidth,
                                            }}
                                            key={i}
                                        >
                                            {column.renderCell
                                                ? column.renderCell(row)
                                                : row[column.field]}
                                        </td>
                                    )
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {footer}
        </>
    );
}

export function CustomPageSizeInput({value, onChange}: any) {
    return (
        <label className="tablePageSizeInput">
            <span>Показать: </span>
            <input
                className="outline-none"
                type="text"
                value={value}
                onChange={(e) => {
                    if (onChange) {
                        onChange(e);
                    }
                }}
            />
        </label>
    );
}

export function CheckForPositiveNumbers(value: any) {
    let valueReady = value.replace(/[^0-9]/g, ""); // Удаление всего, кроме цифр
    return valueReady.replace(/^0+/, "");
}

export const ValidatePhoneNumber = (input_str: string) => {
    // Отфильтруем символы, оставим только цифры и знак "+"
    const filteredValue = input_str.replace(/[^0-9+]/g, '');

    // Если в начале ввода нет знака "+", добавляем его
    return filteredValue.startsWith('+') ? filteredValue : `+${filteredValue}`
}

export function InputCheckForNumbers(value: string) {
    return value === '' || value < '0' ? '0' : value[0] === '0' ? value.slice(1) : value
}

export function ValidateFormSubmitResponse(response: any, errorFields: any, messageFields: any) {
    return new Promise((resolve, reject) => {
        const newArray: any[] = Object.entries(response).map(([key, value]) => ({ [key]: value }));
        const errors: any = errorFields;
        const messages: any = messageFields;

        for (let i = 0; i < newArray.length; i++) {
            const errorKey: string = Object.keys(newArray[i])[0];
            const currentArrItem: string[] = newArray[i][errorKey];
            errors[errorKey] = true;
            messages[errorKey] = currentArrItem[0];
        }

        resolve({ errors, messages });
        reject('something is wrong...')
    });
}

export function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

export function stringAvatar(name: string, styles: any) {
    const words = name
        .split(" ")
        .filter((word) => word) // Filter out any empty words (e.g., extra spaces);

    const firstLetters = words
        .slice(0, 2) // Get the first two words
        .map((word) => word[0])
        .join(""); // Get the first character of each non-empty word and concatenate them

    return {
        sx: {
            ...styles,
            bgcolor: stringToColor(name),
        },
        children: firstLetters,
    };
}
