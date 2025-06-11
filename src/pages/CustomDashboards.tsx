import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const CustomDashboards: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-datacue-primary text-center">
        Custom Dashboards
      </h1>
      
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        <DotLottieReact
          src="https://lottie.host/16cbad98-d378-4166-a087-8d703f92d252/wjNndofr6J.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      <div className="text-center max-w-lg">
        <h2 className="text-2xl font-semibold text-datacue-primary mb-4">
          Coming Soon
        </h2>
        <p className="text-datacue-primary/70">
          We're working hard on bringing you customizable dashboards with advanced analytics
          and personalized insights for your business needs. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};

export default CustomDashboards;
