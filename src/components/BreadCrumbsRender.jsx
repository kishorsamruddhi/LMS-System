
import React, { Fragment } from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function BreadCrumbsRender({ list = [] }) {
    return (<Breadcrumb>
        <BreadcrumbList>
            {list.map((item, index) => {
                if (item?.href) {
                    return <Fragment key={item.id}>
                        <BreadcrumbItem key={item.id}>
                            <BreadcrumbLink className={"hover:text-cyan-500"} href={item?.href}>{item?.title}</BreadcrumbLink>
                        </BreadcrumbItem>
                        {index + 1 != list.length && <BreadcrumbSeparator />}
                    </Fragment>
                }
                return <Fragment key={item.id}>
                    <BreadcrumbItem key={item.id} className="cursor-default">
                        {item?.title}
                    </BreadcrumbItem>
                    {index + 1 != list.length && <BreadcrumbSeparator />}
                </Fragment>
            })}
        </BreadcrumbList>
    </Breadcrumb>
    )
}
