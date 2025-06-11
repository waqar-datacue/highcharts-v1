import React, { useEffect, useState } from "react";
import Widget from "../components/widgets/Widget";
import { MetricWidget } from '@/components/widgets/MetricWidget';
import ExecutiveSummaryWidget from "../components/widgets/ExecutiveSummaryWidget";
import ChartWidget from "../components/widgets/ChartWidget";
import { useDataContext } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

// Executive summary text - English version
const SUMMARY_TEXT_EN = `Today's market analysis reveals exceptional performance across key metrics. Sales have surged by 15% year-over-year, reaching SAR 2.3M, while our market share has expanded to 23.5%. The Tadawul All Share Index shows a positive trend, up 0.8%, reflecting robust market conditions.

Key Highlights:
• Modern trade channels experienced 28% growth, particularly in hypermarkets
• Urban areas showed 32% higher customer engagement rates
• Premium product lines saw 45% increased adoption
• Customer satisfaction scores improved by 18%

Regional Performance:
• Central Region: 25% growth in distribution coverage
• Western Region: 30% increase in brand visibility
• Eastern Region: 22% rise in market penetration
• Northern Region: 15% improvement in retailer relationships

Consumer Insights:
• Brand loyalty scores up by 12%
• Social media sentiment positive at 78%
• Customer retention rate increased to 85%
• New customer acquisition cost reduced by 20%

Future Opportunities:
• Emerging suburban markets show 40% growth potential
• Premium segment expansion projected at 35%
• E-commerce channel expected to grow by 50%
• New product category potential estimated at SAR 5M

Competitive Landscape:
• Maintained price leadership in 7 out of 8 categories
• Product innovation index leads market by 25%
• Distribution network efficiency up by 15%
• Brand strength index improved by 22%`;

// Arabic version of the summary text
const SUMMARY_TEXT_AR = `يكشف تحليل السوق اليوم عن أداء استثنائي عبر المقاييس الرئيسية. زادت المبيعات بنسبة 15% عن العام الماضي، لتصل إلى 2.3 مليون ريال سعودي، بينما توسعت حصتنا في السوق إلى 23.5%. يظهر مؤشر تداول العام اتجاهًا إيجابيًا، بارتفاع 0.8%، مما يعكس ظروف سوق قوية.

النقاط الرئيسية:
• شهدت قنوات التجارة الحديثة نموًا بنسبة 28%، خاصة في الهايبرماركت
• أظهرت المناطق الحضرية معدلات مشاركة عملاء أعلى بنسبة 32%
• شهدت خطوط المنتجات الفاخرة زيادة في الاعتماد بنسبة 45%
• تحسنت درجات رضا العملاء بنسبة 18%

الأداء الإقليمي:
• المنطقة الوسطى: نمو بنسبة 25% في تغطية التوزيع
• المنطقة الغربية: زيادة بنسبة 30% في رؤية العلامة التجارية
• المنطقة الشرقية: ارتفاع بنسبة 22% في اختراق السوق
• المنطقة الشمالية: تحسن بنسبة 15% في علاقات تجار التجزئة

رؤى المستهلك:
• ارتفاع درجات ولاء العلامة التجارية بنسبة 12%
• المشاعر الإيجابية على وسائل التواصل الاجتماعي بنسبة 78%
• زيادة معدل الاحتفاظ بالعملاء إلى 85%
• انخفاض تكلفة اكتساب عملاء جدد بنسبة 20%

الفرص المستقبلية:
• تظهر الأسواق الضاحية الناشئة إمكانية نمو بنسبة 40%
• من المتوقع أن يتوسع القطاع الفاخر بنسبة 35%
• من المتوقع أن تنمو قناة التجارة الإلكترونية بنسبة 50%
• إمكانية فئة المنتجات الجديدة تقدر بـ 5 ملايين ريال سعودي

المشهد التنافسي:
• الحفاظ على ريادة الأسعار في 7 من أصل 8 فئات
• مؤشر ابتكار المنتجات يتفوق على السوق بنسبة 25%
• ارتفاع كفاءة شبكة التوزيع بنسبة 15%
• تحسن مؤشر قوة العلامة التجارية بنسبة 22%`;

const baseExpandedSummaryText = "Today's category performance shows strong growth with a 15% increase in sales value and 2.3% market share. The Tadawul All Share Index is up 0.8%, indicating positive market sentiment. Key highlights include strong performance in modern trade channels and urban areas. Modern trade channels showed particularly strong growth, with a 20% increase in sales value. Urban areas continue to lead in market share, while rural areas show promising growth potential. The category's performance is well-aligned with overall market trends, suggesting continued positive momentum.";

const Dashboard: React.FC = (): React.ReactNode => {
  const { filters } = useDataContext();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [salesValue, setSalesValue] = useState<string>("3.2M");
  const [salesChange, setSalesChange] = useState(5.2);
  const [shareValue, setShareValue] = useState("42.3");
  const [shareChange, setShareChange] = useState(1.7);
  
  // Define actual category ID that should match user permissions
  // This should NOT be translated as it's used for access control
  const BEVERAGE_CATEGORY = "Beverages";
  
  // Use different summary text based on current language
  const summaryText = i18n.language === 'ar' ? SUMMARY_TEXT_AR : SUMMARY_TEXT_EN;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSalesValue("2.3M");
      setSalesChange(5.2);
      setShareValue("42.3");
      setShareChange(1.7);
    }, 2000);

    return () => clearTimeout(timer);
  }, [filters]);

  // Prepare widget data
  const salesData = {
    title: t('dashboard.metrics.sales_value'),
    value: salesValue,
    isCurrency: true,
    change: salesChange
  };

  const shareData = {
    title: t('dashboard.metrics.market_share'),
    value: shareValue,
    suffix: t('dashboard.currency.percent'),
    change: shareChange
  };

  const tadawulData = {
    title: t('dashboard.metrics.tasi_short'),
    value: "12,458.32",
    change: -0.8
  };


  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-datacue-primary">{t('dashboard.title')}</h1>
        <p className="text-datacue-primary/70">
          {t('dashboard.overview')}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Widget
          id="sales-value-metric"
          title={t('dashboard.metrics.sales_value')}
          category={BEVERAGE_CATEGORY}
          categoryDisplayName={t('dashboard.metrics.beverage')}
          data={{ value: salesValue }}
          showDownloadButton={false}
          showAIButton={false}
        >
          <MetricWidget
            title={t('dashboard.metrics.sales_value')}
            value={salesValue}
            isCurrency={true}
            change={salesChange}
          />
        </Widget>
        <Widget
          id="market-share"
          title={t('dashboard.metrics.market_share')}
          category={BEVERAGE_CATEGORY}
          categoryDisplayName={t('dashboard.metrics.beverage')}
          isFixed={true}
          showDownloadButton={false}
          showAIButton={false}
        >
          <MetricWidget
            title={t('dashboard.metrics.market_share')}
            value={shareValue}
            suffix={t('dashboard.currency.percent')}
            change={shareChange}
          />
        </Widget>
        <Widget
          id="tasi"
          title={t('dashboard.metrics.tadawul_index')}
          category={BEVERAGE_CATEGORY}
          categoryDisplayName={t('dashboard.metrics.beverage')}
          isFixed={true}
          showDownloadButton={false}
          showAIButton={false}
        >
          <MetricWidget
            title={t('dashboard.metrics.tasi_short')}
            value="12,458.32"
            change={tadawulData.change}
          />
        </Widget>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 gap-4">
        <ExecutiveSummaryWidget
          id="daily-summary"
          summary={summaryText}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default Dashboard;
