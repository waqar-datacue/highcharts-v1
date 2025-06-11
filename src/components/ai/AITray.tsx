import React, { useState, useRef, useEffect } from "react";
import { useAI } from "../../contexts/AIContext";
import { X, Send, Download, Play, Volume2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

const AITray: React.FC = () => {
  const { 
    isAITrayOpen, 
    closeAITray, 
    currentWidgetData,
    aiMessages,
    addUserMessage,
    isLoading
  } = useAI();
  
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isPlayingAudio = useRef(false);
  const [isTextToSpeech, setIsTextToSpeech] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    
    addUserMessage(userInput);
    setUserInput("");
  };

  const handleExportCSV = () => {
    if (!currentWidgetData) return;
    
    toast.success(`Exporting ${currentWidgetData.title} data as CSV`);
    // In a real app, we'd implement actual CSV export here
  };

  const handleTextToSpeech = () => {
    if (!aiMessages.length) return;
    
    setIsTextToSpeech(!isTextToSpeech);
    
    if (!isTextToSpeech) {
      // Start text to speech
      toast.success("Text-to-speech started");
      isPlayingAudio.current = true;
      // In a real app, we'd implement actual TTS here
    } else {
      // Stop text to speech
      toast.info("Text-to-speech stopped");
      isPlayingAudio.current = false;
    }
  };

  return (
    <div 
      className={cn(
        "fixed top-0 right-0 w-72 h-full bg-white shadow-lg border-l border-gray-200 z-10",
        "flex flex-col transform transition-all duration-300 ease-in-out",
        isAITrayOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between border-b border-gray-200 p-4",
        "transition-all duration-300 ease-in-out",
        isAITrayOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      )}>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <h3 className="font-medium text-datacue-primary">AI Insights</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportCSV}
            className="h-7 w-7 rounded-full hover:bg-datacue-accent/20 transition-colors duration-200"
          >
            <Download size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 rounded-full hover:bg-datacue-accent/20 transition-colors duration-200",
              isTextToSpeech && "bg-datacue-accent"
            )}
            onClick={handleTextToSpeech}
          >
            {isTextToSpeech ? <Volume2 size={15} /> : <Play size={15} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeAITray}
            className="h-7 w-7 rounded-full hover:bg-datacue-accent/20 transition-colors duration-200"
          >
            <X size={15} />
          </Button>
        </div>
      </div>

      {/* Widget Info */}
      {currentWidgetData && (
        <div className={cn(
          "bg-gray-50 p-3 border-b border-gray-200",
          "transition-all duration-300 ease-in-out delay-75",
          isAITrayOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        )}>
          <h4 className="font-medium text-sm text-datacue-primary">
            {currentWidgetData.title}
          </h4>
          <p className="text-xs text-gray-500">
            AI analysis and insights for this data
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 space-y-4",
        "transition-all duration-300 ease-in-out delay-100",
        isAITrayOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      )}>
        {aiMessages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[90%] p-3 rounded-lg transition-all duration-200",
              message.role === "assistant"
                ? "bg-datacue-accent text-datacue-primary mr-auto hover:bg-datacue-accent/90"
                : "bg-gray-100 text-gray-800 ml-auto hover:bg-gray-200"
            )}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bg-datacue-accent text-datacue-primary max-w-[90%] p-3 rounded-lg mr-auto">
            <div className="flex space-x-1 items-center">
              <div className="h-2 w-2 bg-datacue-primary rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-datacue-primary rounded-full animate-pulse delay-100"></div>
              <div className="h-2 w-2 bg-datacue-primary rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className={cn(
        "border-t border-gray-200 p-3",
        "transition-all duration-300 ease-in-out delay-150",
        isAITrayOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}>
        <div className="flex items-center space-x-2">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask a question about this data..."
            className="min-h-[60px] resize-none transition-all duration-200 focus:ring-2 focus:ring-datacue-primary/20"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!userInput.trim() || isLoading}
            className="h-[60px] bg-datacue-primary hover:bg-datacue-primary/90 transition-all duration-200 transform hover:scale-105"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AITray;
