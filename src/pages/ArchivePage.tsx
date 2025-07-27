import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  name: string;
  date: Date;
  type: "incoming" | "outgoing";
}

const ArchivePage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDocumentName, setNewDocumentName] = useState<string>("");
  const [newDocumentDate, setNewDocumentDate] = useState<Date | undefined>(undefined);
  const [newDocumentType, setNewDocumentType] = useState<"incoming" | "outgoing">("incoming");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

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
    };

    setDocuments((prev) => [...prev, newDoc]);
    setNewDocumentName("");
    setNewDocumentDate(undefined);
    showSuccess("تمت أرشفة المستند بنجاح!");
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesType = doc.type === activeTab;
      const matchesName = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = format(doc.date, "PPP").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && (matchesName || matchesDate);
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [documents, activeTab, searchQuery]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">نظام أرشفة الملفات</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>أرشفة مستند جديد</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="docName" className="mb-2 block">اسم المستند</Label>
            <Input
              id="docName"
              placeholder="أدخل اسم المستند"
              value={newDocumentName}
              onChange={(e) => setNewDocumentName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="docDate" className="mb-2 block">تاريخ الأرشفة</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newDocumentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newDocumentDate ? format(newDocumentDate, "PPP") : <span>اختر تاريخ</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
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
            <Label htmlFor="docType" className="mb-2 block">نوع المستند</Label>
            <Select value={newDocumentType} onValueChange={(value: "incoming" | "outgoing") => setNewDocumentType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incoming">وارد</SelectItem>
                <SelectItem value="outgoing">صادر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <Button onClick={handleAddDocument}>أرشفة المستند</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>البحث عن المستندات</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="ابحث بالاسم أو التاريخ (مثال: 2023)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value: "incoming" | "outgoing") => setActiveTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming">أرشيف الوارد</TabsTrigger>
          <TabsTrigger value="outgoing">أرشيف الصادر</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming">
          <Card>
            <CardHeader>
              <CardTitle>المستندات الواردة</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <p className="text-center text-muted-foreground">لا توجد مستندات واردة مطابقة.</p>
              ) : (
                <div className="grid gap-4">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{format(doc.date, "PPP")}</p>
                      </div>
                      <Badge variant="secondary">{doc.type === "incoming" ? "وارد" : "صادر"}</Badge>
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
              <CardTitle>المستندات الصادرة</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <p className="text-center text-muted-foreground">لا توجد مستندات صادرة مطابقة.</p>
              ) : (
                <div className="grid gap-4">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{format(doc.date, "PPP")}</p>
                      </div>
                      <Badge variant="secondary">{doc.type === "incoming" ? "وارد" : "صادر"}</Badge>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArchivePage;