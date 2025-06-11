import React, { createContext, useState, useContext } from "react";

type WidgetData = {
  id: string;
  title: string;
  type: string;
  data: any;
  category?: string;
};

interface AIContextType {
  isAITrayOpen: boolean;
  currentWidgetData: WidgetData | null;
  openAITray: (widgetData: WidgetData) => void;
  closeAITray: () => void;
  aiMessages: Array<{ role: "user" | "assistant"; content: string }>;
  addUserMessage: (message: string) => void;
  isLoading: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAITrayOpen, setIsAITrayOpen] = useState(false);
  const [currentWidgetData, setCurrentWidgetData] = useState<WidgetData | null>(null);
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const openAITray = (widgetData: WidgetData) => {
    setCurrentWidgetData(widgetData);
    
    // Generate initial insight for the widget
    setAiMessages([
      { 
        role: "assistant", 
        content: `I've analyzed the ${widgetData.title} data${widgetData.category ? ` for ${widgetData.category}` : ''}. What insights would you like me to provide?` 
      }
    ]);
    
    setIsAITrayOpen(true);
  };

  const closeAITray = () => {
    setIsAITrayOpen(false);
    setCurrentWidgetData(null);
    setAiMessages([]);
  };

  const addUserMessage = async (message: string) => {
    // Add user message to the list
    setAiMessages(prev => [...prev, { role: "user", content: message }]);
    setIsLoading(true);

    // Mock AI response delay
    setTimeout(() => {
      const aiResponse = `Based on the ${currentWidgetData?.title} data${currentWidgetData?.category ? ` for ${currentWidgetData.category}` : ''}, I can tell you that there's been a 5% increase in the metrics compared to last week. This is likely due to seasonal factors and recent marketing campaigns.`;
      
      setAiMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AIContext.Provider
      value={{
        isAITrayOpen,
        currentWidgetData,
        openAITray,
        closeAITray,
        aiMessages,
        addUserMessage,
        isLoading,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
