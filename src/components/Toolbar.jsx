import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";

/**
 * Reusable toolbar component that appears at the top of all pages
 * @param {Object} props
 * @param {React.ReactNode} props.children - Additional content to display on the right side
 */
export function Toolbar({ children }) {
    return (
        <div className="flex items-center justify-between border-b py-2 px-4">
            <Button
                variant="ghost"
                className="text-lg font-semibold hover:bg-transparent p-0 h-auto flex items-center gap-2"
                asChild
            >
                <Link to="/">
                    <CalendarCheck className="w-5 h-5" />
                    Dihadi
                </Link>
            </Button>
            {children && (
                <div className="flex items-center space-x-2">
                    {children}
                </div>
            )}
        </div>
    );
}
