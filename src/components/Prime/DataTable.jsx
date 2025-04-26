const DataTable = ({ columns, data, action }) => {
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
                        {action?.header &&
                            <th
                                className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                            >
                                {action.header}
                            </th>}
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
                                    {getValueByPath(row, col.field)}
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
                </tbody>
            </table>
        </div>
    );
};

function getValueByPath(obj, path) {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
        if (value && key in value) {
            value = value[key];
        } else {
            return "";
        }
    }

    return value;
}


export default DataTable