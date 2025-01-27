"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  Calendar,
  Tag,
  Trash2,
  Edit,
  MoreVertical,
  AlertCircle,
  X,
  Globe,
  Briefcase,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useCRMStore, Lead, LeadStatus, LeadSource, LeadPriority } from "@/lib/store/crm-store";
import { useCompanyStore, Company } from "@/lib/store/company-store";

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-500/10 text-blue-500",
  contacted: "bg-yellow-500/10 text-yellow-500",
  qualified: "bg-green-500/10 text-green-500",
  proposal: "bg-purple-500/10 text-purple-500",
  negotiation: "bg-orange-500/10 text-orange-500",
  closed: "bg-emerald-500/10 text-emerald-500",
  lost: "bg-red-500/10 text-red-500",
};

const priorityColors: Record<LeadPriority, string> = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-red-500/10 text-red-500",
};

export default function CRMPage() {
  const { user } = useAuth();
  const { leads, addLead, updateLead, deleteLead } = useCRMStore();
  const { companies, addCompany } = useCompanyStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    type: "company" as Company["type"],
    industry: "",
    website: "",
    createdBy: user?.uid || "",
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [newLead, setNewLead] = useState<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>({
    companyId: "",
    companyName: "",
    contactName: "",
    contactTitle: "",
    email: "",
    phone: "",
    status: "new",
    source: "website",
    priority: "medium",
    value: 0,
    notes: "",
    lastContact: new Date().toISOString(),
    nextFollowUp: null,
    tags: [],
    createdBy: user?.uid || "",
  });

  // Set first company as active if none selected
  useEffect(() => {
    if (companies.length > 0 && !activeCompanyId) {
      setActiveCompanyId(companies[0].id);
    }
  }, [companies, activeCompanyId]);

  const filteredLeads = leads.filter(lead => {
    const matchesCompany = lead.companyId === activeCompanyId;
    const matchesSearch = searchQuery
      ? lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCompany && matchesSearch;
  });

  const handleAddCompany = async () => {
    if (!user) return;

    try {
      await addCompany(newCompany);
      setNewCompany({
        name: "",
        type: "company",
        industry: "",
        website: "",
        createdBy: user.uid,
      });
      setIsNewCompanyOpen(false);
      setNotification({ type: 'success', message: 'Company added successfully' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to add company' });
    }
  };

  const handleAddLead = async () => {
    if (!user || !activeCompanyId) return;

    try {
      const activeCompany = companies.find(c => c.id === activeCompanyId);
      if (!activeCompany) return;

      await addLead({
        ...newLead,
        companyId: activeCompanyId,
        companyName: activeCompany.name,
        createdBy: user.uid,
      });
      
      setNewLead({
        companyId: "",
        companyName: "",
        contactName: "",
        contactTitle: "",
        email: "",
        phone: "",
        status: "new",
        source: "website",
        priority: "medium",
        value: 0,
        notes: "",
        lastContact: new Date().toISOString(),
        nextFollowUp: null,
        tags: [],
        createdBy: user.uid,
      });
      setIsNewLeadOpen(false);
      setNotification({ type: 'success', message: 'Lead added successfully' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to add lead' });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      {notification && (
        <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">CRM</h1>
        </div>
        <Button onClick={() => setIsNewCompanyOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Company Tabs */}
      <div className="mb-6">
        <ScrollArea className="w-full" >
          <div className="flex gap-2 min-w-full p-1">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => setActiveCompanyId(company.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${activeCompanyId === company.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                  }
                `}
              >
                {company.type === 'company' ? (
                  <Building2 className="h-4 w-4" />
                ) : company.type === 'business' ? (
                  <Briefcase className="h-4 w-4" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                <span>{company.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setIsNewLeadOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </Card>

        {/* Leads Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Next Follow-up</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.contactName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[lead.status]}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[lead.priority]}>
                      {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${lead.value.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {lead.nextFollowUp ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={
                          isAfter(new Date(), parseISO(lead.nextFollowUp))
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }>
                          {format(parseISO(lead.nextFollowUp), "MMM d, yyyy")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not scheduled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteLead(lead.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 className="h-8 w-8" />
                      <p>No leads found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add Company Dialog */}
      <Dialog open={isNewCompanyOpen} onOpenChange={setIsNewCompanyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newCompany.type}
                onValueChange={(value: Company["type"]) =>
                  setNewCompany({ ...newCompany, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input
                value={newCompany.industry}
                onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                placeholder="Enter industry"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={newCompany.website}
                onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                placeholder="Enter website URL"
              />
            </div>
            <Button onClick={handleAddCompany} className="w-full">
              Add Company
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={newLead.contactName}
                  onChange={(e) => setNewLead({ ...newLead, contactName: e.target.value })}
                  placeholder="Enter contact name"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Title</Label>
                <Input
                  value={newLead.contactTitle}
                  onChange={(e) => setNewLead({ ...newLead, contactTitle: e.target.value })}
                  placeholder="Enter contact title"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newLead.status}
                  onValueChange={(value: LeadStatus) =>
                    setNewLead({ ...newLead, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newLead.priority}
                  onValueChange={(value: LeadPriority) =>
                    setNewLead({ ...newLead, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deal Value</Label>
                <Input
                  type="number"
                  value={newLead.value}
                  onChange={(e) => setNewLead({ ...newLead, value: parseInt(e.target.value) || 0 })}
                  placeholder="Enter deal value"
                />
              </div>
              <div className="space-y-2">
                <Label>Next Follow-up</Label>
                <Input
                  type="date"
                  value={newLead.nextFollowUp || ""}
                  onChange={(e) => setNewLead({ ...newLead, nextFollowUp: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                placeholder="Enter notes about the lead"
                rows={4}
              />
            </div>
            <Button onClick={handleAddLead} className="w-full">
              Add Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}