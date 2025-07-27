import React, { useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday } from "date-fns";
import { 
  CalendarIcon, 
  FileTextIcon, 
  UploadIcon, 
  SearchIcon, 
  Trash2Icon, 
  FolderArchiveIcon, 
  EyeIcon,
  ArrowDownToLine, // New import for incoming documents icon
  ArrowUpFromLine // New import for outgoing documents icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
// import { Toaster } from "@/components/ui/toaster"; // This import is not needed here as Toaster is in App.tsx

interface Document {
  id: string;
  name: string;
  date: Date;
  type: "incoming" | "outgoing";
  keywords?: string;
  fileName?: string; // To store the uploaded file name
}

const ArchivePage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDocumentName, setNewDocumentName] = useState<string>("");
  const [newDocumentDate, setNewDocumentDate] = useState<Date | undefined>(undefined);
  const [newDocumentType, setNewDocumentType] = useState<"incoming" | "outgoing">("incoming");
  const [newDocumentKeywords, setNewDocumentKeywords] = useState<string>("");
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddDocument = () => {
    if (!newDocumentName || !newDocumentDate) {
      showError("الرجاء إدخال اسم وتاريخ المستند.");
      return;
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      name: newDocumentName,
      date: newDocumentDate,
      type: newDocumentType,
      keywords: newDocumentKeywords,
      fileName: newDocumentFile ? newDocumentFile.name : undefined,
    };

    setDocuments((prev) => [...prev, newDoc]);
    setNewDocumentName("");
    setNewDocumentDate(undefined);
    setNewDocumentKeywords("");
    setNewDocumentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input
    }
    showSuccess("تمت أرشفة المستند بنجاح!");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchDate(undefined);
  };

  const handleScanClick = () => {
    showError("وظيفة المسح الضوئي غير مدعومة في تطبيق الويب.");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewDocumentFile(event.target.files[0]);
      showSuccess(`تم تحديد الملف: ${event.target.files[0].name}`);
    }
  };

  const handleViewDocument = (doc: Document) => {
    showSuccess(`عرض المستند: ${doc.name} (الملف: ${doc.fileName || 'لا يوجد ملف مرفق'})`);
    // In a real application, you would open a modal or navigate to a view page
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesType = doc.type === activeTab;
      const matchesNameOrKeywords = 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.keywords && doc.keywords.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDate = searchDate 
        ? format(doc.date, "yyyy-MM-dd") === format(searchDate, "yyyy-MM-dd")
        : true;

      return matchesType && matchesNameOrKeywords && matchesDate;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [documents, activeTab, searchQuery, searchDate]);

  const totalDocuments = documents.length;
  const incomingDocuments = documents.filter(doc => doc.type === "incoming").length;
  const outgoingDocuments = documents.filter(doc => doc.type === "outgoing").length;
  const todayDocuments = documents.filter(doc => isToday(doc.date)).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderArchiveIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-right">نظام أرشفة الملفات</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-right">إدارة وأرشفة الوثائق الرقمية</p>
          </div>
        </div>
        <Trash2Icon className="h-6 w-6 text-gray-500 dark:text-gray-400 cursor-pointer" />
      </header>

      <div className="container mx-auto p-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center p-4 flex flex-col items-center justify-center">
            <FileTextIcon className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle className="text-lg">إجمالي المستندات</CardTitle>
            <CardContent className="text-3xl font-bold p-0">{totalDocuments}</CardContent>
          </Card>
          <Card className="text-center p-4 flex flex-col items-center justify-center">
            <ArrowDownToLine className="h-8 w-8 text-green-500 mb-2" /> {/* Changed icon */}
            <CardTitle className="text-lg">المستندات الواردة</CardTitle>
            <CardContent className="text-3xl font-bold p-0">{incomingDocuments}</CardContent>
          </Card>
          <Card className="text-center p-4 flex flex-col items-center justify-center">
            <ArrowUpFromLine className="h-8 w-8 text-orange-500 mb-2" /> {/* Changed icon */}
            <CardTitle className="text-lg">المستندات الصادرة</CardTitle>
            <CardContent className="text-3xl font-bold p-0">{outgoingDocuments}</CardContent>
          </Card>
          <Card className="text-center p-4 flex flex-col items-center justify-center">
            <CalendarIcon className="h-8 w-8 text-purple-500 mb-2" />
            <CardTitle className="text-lg">مستندات اليوم</CardTitle>
            <CardContent className="text-3xl font-bold p-0">{todayDocuments}</CardContent>
          </Card>
        </div>

        {/* Main Content: Archive Form and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Scan and Archive Incoming Documents */}
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle className="text-right">مسح وأرشفة المستندات</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleScanClick} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <FileTextIcon className="ml-2 h-4 w-4" /> مسح ضوئي
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700"
                >
                  <UploadIcon className="ml-2 h-4 w-4" /> رفع صورة
                </Button>
              </div>
              {newDocumentFile && (
                <p className="text-sm text-gray-500 text-right">الملف المحدد: {newDocumentFile.name}</p>
              )}
              <div>
                <Label htmlFor="docName" className="mb-2 block text-right">اسم المستند</Label>
                <Input
                  id="docName"
                  placeholder="أدخل اسم المستند"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="docKeywords" className="mb-2 block text-right">الكلمات المفتاحية (اختيارية)</Label>
                <Textarea
                  id="docKeywords"
                  placeholder="أدخل الكلمات المفتاحية مفصولة بفاصلة"
                  value={newDocumentKeywords}
                  onChange={(e) => setNewDocumentKeywords(e.target.value)}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="docDate" className="mb-2 block text-right">تاريخ الأرشفة</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-end text-right font-normal",
                        !newDocumentDate && "text-muted-foreground"
                      )}
                    >
                      {newDocumentDate ? format(newDocumentDate, "PPP") : <span>اختر تاريخ</span>}
                      <CalendarIcon className="mr-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end" dir="rtl"> {/* Moved dir="rtl" here */}
                    <Calendar
                      mode="single"
                      selected={newDocumentDate}
                      onSelect={setNewDocumentDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="docType" className="mb-2 block text-right">نوع المستند</Label>
                <Select value={newDocumentType} onValueChange={(value: "incoming" | "outgoing") => setNewDocumentType(value)}>
                  <SelectTrigger className="w-full text-right">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent dir="rtl"> {/* Ensure Select Content opens RTL */}
                    <SelectItem value="incoming">وارد</SelectItem>
                    <SelectItem value="outgoing">صادر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddDocument} className="w-full bg-blue-600 hover:bg-blue-700 text-white">حفظ في الأرشيف</Button>
            </CardContent>
          </Card>

          {/* Search in Archive */}
          <Card className="order-1 lg:order-2">
            <CardHeader>
              <CardTitle className="text-right">البحث في الأرشيف</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label htmlFor="searchName" className="mb-2 block text-right">البحث بالاسم أو الكلمات المفتاحية</Label>
                <Input
                  id="searchName"
                  placeholder="...ابحث في المستندات"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="searchDate" className="mb-2 block text-right">البحث بالتاريخ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-end text-right font-normal",
                        !searchDate && "text-muted-foreground"
                      )}
                    >
                      {searchDate ? format(searchDate, "PPP") : <span>mm/dd/yyyy</span>}
                      <CalendarIcon className="mr-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end" dir="rtl"> {/* Moved dir="rtl" here */}
                    <Calendar
                      mode="single"
                      selected={searchDate}
                      onSelect={setSearchDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleClearSearch} variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">مسح</Button>
            </CardContent>
          </Card>
        </div>

        {/* Document List Tabs */}
        <Tabs value={activeTab} onValueChange={(value: "incoming" | "outgoing") => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-200 dark:bg-gray-700 rounded-md p-1 mb-4">
            <TabsTrigger value="incoming" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">أرشيف الوارد</TabsTrigger>
            <TabsTrigger value="outgoing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">أرشيف الصادر</TabsTrigger>
          </TabsList>
          <TabsContent value="incoming">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">المستندات الواردة</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredDocuments.length === 0 ? (
                  <p className="text-center text-muted-foreground">لا توجد مستندات واردة مطابقة.</p>
                ) : (
                  <div className="grid gap-4">
                    {filteredDocuments.map((doc) => (
                      <Card key={doc.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-right">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{doc.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center justify-end sm:justify-start gap-1">
                            <CalendarIcon className="h-3 w-3 ml-1" /> {format(doc.date, "dd MMMM yyyy")}
                          </p>
                          {doc.keywords && (
                            <div className="flex flex-wrap gap-1 mt-2 justify-end sm:justify-start">
                              {doc.keywords.split(',').map((keyword, index) => (
                                <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {keyword.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 sm:mt-0 mr-0 sm:mr-4 flex items-center gap-1"
                          onClick={() => handleViewDocument(doc)}
                        >
                          عرض <EyeIcon className="mr-1 h-4 w-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="outgoing">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">المستندات الصادرة</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredDocuments.length === 0 ? (
                  <p className="text-center text-muted-foreground">لا توجد مستندات صادرة مطابقة.</p>
                ) : (
                  <div className="grid gap-4">
                    {filteredDocuments.map((doc) => (
                      <Card key={doc.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-right">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{doc.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center justify-end sm:justify-start gap-1">
                            <CalendarIcon className="h-3 w-3 ml-1" /> {format(doc.date, "dd MMMM yyyy")}
                          </p>
                          {doc.keywords && (
                            <div className="flex flex-wrap gap-1 mt-2 justify-end sm:justify-start">
                              {doc.keywords.split(',').map((keyword, index) => (
                                <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {keyword.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 sm:mt-0 mr-0 sm:mr-4 flex items-center gap-1"
                          onClick={() => handleViewDocument(doc)}
                        >
                          عرض <EyeIcon className="mr-1 h-4 w-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArchivePage;