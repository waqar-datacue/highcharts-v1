import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Play, Pause, BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SummaryWidgetProps {
  id: string;
  title: string;
  summary: string;
  expandedSummary: string;
}

const SummaryWidget: React.FC<SummaryWidgetProps> = ({
  id,
  title,
  summary,
  expandedSummary,
}) => {
  const [isReading, setIsReading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleRead = () => {
    setIsReading(!isReading);
  };

  const [audio] = useState(() => typeof Audio !== 'undefined' ? new Audio('/demo-summary.mp3') : null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [audio]);

  const handleListen = () => {
    if (!audio) return;

    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      audio.play();
      toast.success("Starting audio playback");
    } else {
      audio.pause();
      toast.info("Paused audio playback");
    }
  };

  return (
    <div className="relative min-h-[200px] p-6 rounded-lg bg-background/50 backdrop-blur-sm">
      <AnimatePresence>
        {!isReading && !isPlaying && (
          <motion.div 
            className="flex justify-center items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={handleRead}
              className="min-w-[120px] bg-background/80 hover:bg-background hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Read
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleListen}
              className="min-w-[120px] bg-background/80 hover:bg-background hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out"
            >
              <Play className="mr-2 h-5 w-5" />
              Listen
            </Button>
          </motion.div>
        )}

        {isReading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <motion.div
              initial={{ x: "50%", y: 0 }}
              animate={{ x: 0, y: 0 }}
              className="absolute top-0 left-0"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRead}
                className="mb-4"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Close
              </Button>
            </motion.div>
            <div className="pt-12 text-sm text-datacue-primary leading-relaxed">
              {expandedSummary}
            </div>
          </motion.div>
        )}

        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-full max-w-md p-4 rounded-lg bg-background/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium">Now Playing</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleListen}
                  className={cn(
                    "h-8 w-8 p-0",
                    isPlaying && "text-datacue-accent"
                  )}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-datacue-accent transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1:23</span>
                  <span>3:45</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SummaryWidget;
