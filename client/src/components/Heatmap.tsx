import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapProps {
    data: { date: string; count: number }[];
}

export const Heatmap = ({ data }: HeatmapProps) => {
    const getIntensityClass = (count: number) => {
        if (count === 0) return "bg-muted";
        if (count <= 2) return "bg-yellow-500"; // Dark yellow for less activity
        if (count <= 5) return "bg-yellow-400"; // Medium-dark yellow
        if (count <= 10) return "bg-yellow-300"; // Medium yellow
        if (count <= 15) return "bg-yellow-200"; // Light yellow
        return "bg-yellow-100"; // Very light yellow for most activity
    };

    // Generate full year (365 days) - LeetCode style
    const totalDays = 365;
    const daysInWeek = 7;
    const today = new Date();

    const heatmapData = Array.from({ length: totalDays }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (totalDays - i - 1));
        const dateStr = date.toISOString().split('T')[0];
        const entry = data.find(d => d.date === dateStr);
        return {
            date: dateStr,
            count: entry?.count || 0,
            day: date.getDay(),
            month: date.getMonth(),
        };
    });

    // Organize by weeks with proper alignment
    const weeks = Math.ceil(totalDays / daysInWeek);
    const weekData = Array.from({ length: weeks }, (_, weekIndex) => {
        return heatmapData.slice(weekIndex * daysInWeek, (weekIndex + 1) * daysInWeek);
    });

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-card">
            <h3 className="text-lg font-semibold mb-4">365 Days Activity</h3>
            <TooltipProvider>
                <div className="overflow-x-auto">
                    <div className="flex gap-[3px] min-w-max">
                        {weekData.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-[3px]">
                                {week.map((day, dayIdx) => (
                                    <Tooltip key={`${weekIdx}-${dayIdx}`}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`w-[11px] h-[11px] rounded-sm transition-all hover:scale-125 cursor-pointer ${getIntensityClass(day.count)}`}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">
                                                {day.date}: {day.count} cards studied
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </TooltipProvider>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-muted rounded-sm" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
                    <div className="w-3 h-3 bg-yellow-300 rounded-sm" />
                    <div className="w-3 h-3 bg-yellow-200 rounded-sm" />
                    <div className="w-3 h-3 bg-yellow-100 rounded-sm" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
};
