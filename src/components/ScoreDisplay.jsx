import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export function ScoreDisplay({ actions, habits }) {
    const totalActions = habits.length;
    const completedActions = actions.filter(action => action.completed).length;
    const completionRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

    return (
        <Card className="p-4 mb-4 flex items-center justify-between bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
            <div>
                <h2 className="text-xl font-semibold">Today's Progress</h2>
                <p className="text-sm opacity-90">{completedActions} of {totalActions} habits completed</p>
            </div>
            <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                <span className="text-2xl font-bold">{Math.round(completionRate)}%</span>
            </div>
        </Card>
    );
}