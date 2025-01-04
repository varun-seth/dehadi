import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef(
    ({ className, ...props }, ref) => (
        <SelectPrimitive.Root {...props}>
            <SelectPrimitive.Trigger
                ref={ref}
                className={cn(
                    "flex h-9 w-[120px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
            >
                <SelectPrimitive.Value />
                <SelectPrimitive.Icon>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Content
                position="popper"
                sideOffset={4}
                className="z-50 min-w-[120px] rounded-md border bg-popover p-1 text-base shadow-md"
            >
                <SelectPrimitive.Viewport>
                    {props.children}
                </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Root>
    )
)
Select.displayName = "Select"

const SelectItem = React.forwardRef(
    ({ className, children, ...props }, ref) => (
        <SelectPrimitive.Item
            ref={ref}
            className={cn(
                "flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-base outline-none focus:bg-accent focus:text-accent-foreground",
                className
            )}
            {...props}
        >
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    )
)
SelectItem.displayName = "SelectItem"

export { Select, SelectItem }
