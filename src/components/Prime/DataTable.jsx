import React from "react";

const DataTable = ({ columns, data, action, minRows = 6 }) => {
    const isEmpty = data.length === 0
    const rowStyle = "px-6 py-3 text-left text-sm font-medium text-gray-700"
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 shadow-sm">
                <thead className="bg-gray-100">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} className={rowStyle}>
                                {col.header}
                            </th>
                        ))}
                        {action?.header &&
                            <th className={rowStyle}>{action.header}</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {isEmpty ?
                        <tr>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                no records found
                            </td>
                        </tr> :
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 text-sm text-gray-800"
                                    >
                                        {getValueData(row, col)}
                                    </td>
                                ))}
                                {action?.body &&
                                    <td
                                        className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                                    >
                                        {action.body(row)}
                                    </td>}
                            </tr>
                        ))}
                    {data.length < minRows && Array.from({ length: minRows - data.length }).map((_, index) => <tr key={data.length + index}>
                        <td className="px-6 py-4 text-sm text-gray-800 opacity-0">Fill</td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    );
};

function getValueData(obj, header) {
    const keys = header?.field.split('.');
    let value = { ...obj };
    for (const key of keys) {
        if (value && key in value) {
            value = value[key];
        } else {
            return "";
        }
    }
    if (header?.body) {
        return header.body(value)
    }

    return value;
}

export default DataTable