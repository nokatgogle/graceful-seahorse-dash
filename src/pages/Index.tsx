import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">مرحباً بك في تطبيقك</h1>
        <p className="text-xl text-gray-600 mb-6">
          ابدأ في بناء مشروعك الرائع هنا!
        </p>
        <Link to="/archive">
          <Button size="lg" className="text-lg px-8 py-4">
            اذهب إلى نظام الأرشفة
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;