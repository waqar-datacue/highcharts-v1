import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Play, Pause, BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";


interface ExecutiveSummaryWidgetProps {
  id: string;
  summary: string;
  className?: string;
}

const ExecutiveSummaryWidget: React.FC<ExecutiveSummaryWidgetProps> = ({
  id,
  summary,
  className,
}) => {
  const { t, i18n } = useTranslation();
  const [isReading, setIsReading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => typeof Audio !== 'undefined' ? new Audio('/demo-summary.mp3') : null);
  const [progress, setProgress] = useState(0);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [audio]);

  const handleRead = () => {
    setIsReading(!isReading);
  };

  const handleListen = () => {
    if (!audio || isReading) return;

    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      audio.play();
      toast.success(t('common.success') + ": " + t('dashboard.executive_summary.now_playing'));
    } else {
      audio.pause();
      toast.info(t('common.info') + ": " + t('common.pause'));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden",
      className
    )}>
      <div className="pb-2 pt-4 px-6 text-center bg-gradient-to-r from-datacue-accent/5 to-datacue-primary/5">
        <h2 className="text-xl font-semibold text-datacue-primary">
          {t('dashboard.executive_summary.title')}
        </h2>
      </div>
      <div className="p-6">
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div 
              className={cn(
                "flex gap-2",
                isReading || isPlaying ? "justify-start pl-0" : "justify-center"
              )}
              initial={false}
              animate={{
                justifyContent: isReading || isPlaying ? "flex-start" : "center",
                x: isReading || isPlaying ? (isRTL ? 8 : -8) : 0,
                y: isReading || isPlaying ? -20 : 0,
                scale: isReading || isPlaying ? 0.7 : 1,
                marginBottom: isReading || isPlaying ? "0.5rem" : "0"
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleRead}
                className={cn(
                  "min-w-[100px] bg-background/80 hover:bg-background hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out group text-sm h-9 px-4",
                  isReading && "bg-datacue-accent/10 text-datacue-accent"
                )}
              >
                <BookOpen className="me-2 h-5 w-5 group-hover:text-datacue-accent transition-colors" />
                <span className="group-hover:text-datacue-accent transition-colors">
                  {isReading ? t('dashboard.executive_summary.close') : t('dashboard.executive_summary.read')}
                </span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleListen}
                className={cn(
                  "min-w-[100px] bg-background/80 hover:bg-background hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out group text-sm h-9 px-4",
                  isPlaying && "bg-datacue-accent/10 text-datacue-accent"
                )}
              >
                <Play className="me-2 h-5 w-5 group-hover:text-datacue-accent transition-colors" />
                <span className="group-hover:text-datacue-accent transition-colors">
                  {t('dashboard.executive_summary.listen')}
                </span>
              </Button>
            </motion.div>

            <AnimatePresence>
              {isReading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="text-sm text-datacue-primary leading-relaxed whitespace-pre-line">
                    {summary}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isPlaying && !isReading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-4 w-full"
                >
                <motion.div 
                  className="w-full max-w-md p-6 rounded-lg bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm border border-datacue-accent/10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium text-datacue-primary">
                      {t('dashboard.executive_summary.now_playing')}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleListen}
                      className={cn(
                        "h-8 w-8 p-0 hover:text-datacue-accent transition-colors",
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
                      <motion.div 
                        className="h-full bg-datacue-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{audio ? formatTime(audio.currentTime) : "0:00"}</span>
                      <span>{audio ? formatTime(audio.duration || 0) : "0:00"}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummaryWidget;
