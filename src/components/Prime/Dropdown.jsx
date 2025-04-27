import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function emptyFn() {
    return null
}

const Dropdown = ({ options = [], optionLabel, optionValue, value, onChange = emptyFn, placeholder = "Select", className = "min-w-4", contentProps = {}, ...props }) => {
    return (
        <Select onValueChange={onChange} defaultValue={value || undefined} {...props}>
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className={"bg-white"} {...contentProps}>
                {
                    options.length > 0 ? options.map((val, index) => {
                        return <SelectItem key={index} className="hover:bg-gray-100" value={optionValue ? val[optionValue] : val}>{optionLabel ? val[optionLabel] : val}</SelectItem>
                    })
                        : <SelectItem className="hover:bg-gray-100" value="">0 Options found</SelectItem>
                }
            </SelectContent>
        </Select>
    )
}



export default Dropdown