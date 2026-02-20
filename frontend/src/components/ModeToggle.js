import React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle({ className }) {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full transition-all duration-300
                    bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-800 dark:to-slate-950
                    text-slate-800 dark:text-white
                    border-t border-l border-white/50 dark:border-white/10
                    shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),3px_3px_6px_rgba(0,0,0,0.1)] 
                    dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),3px_3px_6px_rgba(0,0,0,0.4)]
                    hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.6)]
                    hover:scale-110 active:scale-95 ${className}`}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
