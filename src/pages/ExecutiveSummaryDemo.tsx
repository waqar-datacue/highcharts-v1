import React from 'react';
import ExecutiveSummaryWidget from '../components/widgets/ExecutiveSummaryWidget';

const demoSummary = `Today's category performance shows strong growth with a 15% increase in sales value and 2.3% market share. The Tadawul All Share Index is up 0.8%, indicating positive market sentiment. Key highlights include strong performance in modern trade channels and urban areas.

Our top-performing products have seen a 25% increase in distribution, particularly in the central and western regions. Customer engagement metrics show a 12% improvement in brand loyalty scores, with social media sentiment trending positively at 78%.

Market analysis suggests continued growth potential in the premium segment, with opportunities for expansion in emerging suburban markets. Competitor activity remains stable, maintaining our competitive advantage in key categories.`;

const ExecutiveSummaryDemo = () => {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <ExecutiveSummaryWidget
          id="demo-summary"
          summary={demoSummary}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ExecutiveSummaryDemo;
