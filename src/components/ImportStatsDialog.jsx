import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ImportStatsDialog({ open, onOpenChange, stats }) {
    const handleClose = () => {
        onOpenChange(false);
        window.location.reload();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Import Successful</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Habits</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                                <div className="text-3xl font-bold">{stats?.habitsExisted || 0}</div>
                                <div className="text-xs text-muted-foreground mt-1">existed</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                                <div className="text-3xl font-bold">{stats?.habitsCreated || 0}</div>
                                <div className="text-xs text-muted-foreground mt-1">created</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                                <div className="text-3xl font-bold">{stats?.habitsUpdated || 0}</div>
                                <div className="text-xs text-muted-foreground mt-1">updated</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Actions</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                                <div className="text-3xl font-bold">{stats?.actionsExisted || 0}</div>
                                <div className="text-xs text-muted-foreground mt-1">existed</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                                <div className="text-3xl font-bold">{stats?.actionsCreated || 0}</div>
                                <div className="text-xs text-muted-foreground mt-1">created</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                                <div className="text-3xl font-bold">{stats?.actionsUpdated || 0}</div>
                                <div className="text-xs text-muted-foreground mt-1">updated</div>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleClose} className="w-full">
                        OK
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
