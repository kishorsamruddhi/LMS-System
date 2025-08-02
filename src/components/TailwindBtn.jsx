import { cn } from "@/utils/cn"
import { Loader } from "lucide-react"
import { Fragment } from "react"

export function ConditionalComponent({ condition, ifData, elseData }) {
    if (condition) return <Fragment>{ifData}</Fragment>
    return <Fragment>{elseData}</Fragment>
}

export function BtnWithLoading({ label, isLoading, btnClass = "", children, loadingLable, ...props }) {
    let content = label
    if (isLoading) {
        content = <Fragment>
            <Loader />  {loadingLable}
        </Fragment>
    }
    if (children) {
        content = children
    }
    return <button className={cn("border font-medium border-neutral-300 py-2 px-4 text-sm rounded-md flex justify-center items-center gap-2",
        " hover:text-cyan-400 hover:border-cyan-400 ",
        "disabled:text-neutral-500 disabled:hover:text-neutral-500",
        btnClass)} {...props}>
        {content}
    </button>
}

export function TailwindBtn({ label, btnClass = "", hoverEffect = true, children, ...props }) {
    let content = label
    if (children) {
        content = children
    }
    return <button className={cn("border w-fit font-medium border-neutral-300 py-2 px-4 text-sm rounded-md flex justify-center items-center gap-2",
        hoverEffect && " hover:text-cyan-400 hover:border-cyan-400 ",
        "disabled:text-neutral-500 disabled:hover:text-neutral-500",
        btnClass)} {...props}>
        {content}
    </button>
}

export const tailwindBtnClasses = cn("border w-fit font-medium border-neutral-300 py-2 px-4 text-sm rounded-md flex justify-center items-center gap-2", " hover:text-cyan-400 hover:border-cyan-400 ",
    "disabled:text-neutral-500 disabled:hover:text-neutral-500",)