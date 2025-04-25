import React from 'react'

const Page = () => {

    const columns = [
        { header: 'Name', field: 'name' },
        { header: 'Email', field: 'email' },
        { header: 'Role', field: 'role' }
    ];

    const data = [
        { name: 'Alice Smith', email: 'alice@example.com', role: 'Admin' },
        { name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
        { name: 'Carol Lee', email: 'carol@example.com', role: 'Viewer' }
    ];

    return (
        <div className='p-6'> Page
            <DataTable columns={columns} data={data} />
        </div>
    )
}


const DataTable = ({ columns, data }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 shadow-sm">
                <thead className="bg-gray-100">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                            {columns.map((col, colIndex) => (
                                <td
                                    key={colIndex}
                                    className="px-6 py-4 text-sm text-gray-800"
                                >
                                    {row[col.field]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Page