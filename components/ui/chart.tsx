import { Legend as RechartLegend, Tooltip as RechartTooltip  } from "recharts";
import { ReactNode } from "react";
export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={className}
      style={
        {
          "--color-desktop": config.desktop?.color,
          "--color-mobile": config.mobile?.color,
          "--color-sarah": config.sarah?.color,
          "--color-mike": config.mike?.color,
          "--color-alex": config.alex?.color,
          "--color-emma": config.emma?.color,
          "--color-james": config.james?.color,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

type RechartProps<T> = T extends React.ComponentType<infer P> ? P : never;


export function ChartTooltip(props: React.ComponentProps<typeof RechartTooltip>) {
  return <RechartTooltip {...props} />;
}

interface ChartLegendContentProps {
  payload?: Array<{
    value: string;
    color: string;
  }>;
}

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  return (
    <div className="flex gap-4">
      {payload?.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="rounded-full w-3 h-3"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
  labelFormatter?: (label: string) => string;
  indicator?: "line" | "dot";
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  indicator = "line",
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {labelFormatter ? labelFormatter(label as string) : label}
          </div>
        </div>
        <div className="grid gap-1">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {indicator === "line" ? (
                <div
                  className="h-0.5 w-3"
                  style={{ backgroundColor: item.color }}
                />
              ) : (
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="text-sm font-medium tabular-nums">
                {item.value}
              </span>
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}