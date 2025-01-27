"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
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
  Phone,
  Mail,
  Calendar,
  Tag,
  Trash2,
  Edit,
  MoreVertical,
  AlertCircle,
  FileText,
  Upload,
  Download,
  MessageCircle,
  Linkedin,

} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useContactStore, Contact, ContactMethod } from "@/lib/store/contact-store";

const contactMethodIcons: Record<ContactMethod, any> = {
  email: Mail,
  phone: Phone,

  linkedin: Linkedin,
  other: MessageCircle,
  whatsapp: undefined,
  telegram: undefined
};

export default function ContactsPage() {
  const { user } = useAuth();
  const { contacts, addContact, updateContact, deleteContact, addDocument, deleteDocument } = useContactStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [newContact, setNewContact] = useState<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>({
    name: "",
    company: "",
    title: "",
    email: "",
    phone: "",
    preferredContact: "email",
    otherContactMethods: [],
    notes: "",
    documents: [],
    tags: [],
    lastContact: new Date().toISOString(),
    nextFollowUp: null,
    createdBy: user?.uid || "",
  });

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.company.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower)
    );
  });

  const handleAddContact = async () => {
    if (!user) return;

    try {
      await addContact({
        ...newContact,
        createdBy: user.uid,
      });
      
      setNewContact({
        name: "",
        company: "",
        title: "",
        email: "",
        phone: "",
        preferredContact: "email",
        otherContactMethods: [],
        notes: "",
        documents: [],
        tags: [],
        lastContact: new Date().toISOString(),
        nextFollowUp: null,
        createdBy: user.uid,
      });
      setIsNewContactOpen(false);
      setNotification({ type: 'success', message: 'Contact added successfully' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to add contact' });
    }
  };

  const handleFileUpload = async (contactId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await addDocument(contactId, file);
      setNotification({ type: 'success', message: 'Document uploaded successfully' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to upload document' });
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
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-muted-foreground">
            Manage your business contacts and collaborators
          </p>
        </div>
        <Button onClick={() => setIsNewContactOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Contacts Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Preferred Contact</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Next Follow-up</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => {
              const PreferredMethodIcon = contactMethodIcons[contact.preferredContact];
              
              return (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.title}</p>
                      <p className="text-sm text-muted-foreground">{contact.company}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <PreferredMethodIcon className="h-4 w-4" />
                      <span className="capitalize">{contact.preferredContact}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(contact.lastContact), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {contact.nextFollowUp ? (
                      format(parseISO(contact.nextFollowUp), "MMM d, yyyy")
                    ) : (
                      <span className="text-muted-foreground">Not scheduled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {contact.documents.length} files
                      </span>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(contact.id, e)}
                        />
                        <Upload className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedContact(contact)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteContact(contact.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                    <p>No contacts found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Contact Dialog */}
      <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Enter contact name"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newContact.title}
                  onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                  placeholder="Enter job title"
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred Contact Method</Label>
                <Select
                  value={newContact.preferredContact}
                  onValueChange={(value: ContactMethod) =>
                    setNewContact({ ...newContact, preferredContact: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Last Contact</Label>
                <Input
                  type="date"
                  value={format(parseISO(newContact.lastContact), "yyyy-MM-dd")}
                  onChange={(e) => setNewContact({ ...newContact, lastContact: new Date(e.target.value).toISOString() })}
                />
              </div>
              <div className="space-y-2">
                <Label>Next Follow-up</Label>
                <Input
                  type="date"
                  value={newContact.nextFollowUp ? format(parseISO(newContact.nextFollowUp), "yyyy-MM-dd") : ""}
                  onChange={(e) => setNewContact({ ...newContact, nextFollowUp: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                placeholder="Enter notes about the contact"
                rows={4}
              />
            </div>
            <Button onClick={handleAddContact} className="w-full">
              Add Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View/Edit Contact Dialog */}
      {selectedContact && (
        <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Contact Details</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={selectedContact.name}
                      onChange={(e) =>
                        setSelectedContact({ ...selectedContact, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={selectedContact.company}
                      onChange={(e) =>
                        setSelectedContact({ ...selectedContact, company: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={selectedContact.title}
                      onChange={(e) =>
                        setSelectedContact({ ...selectedContact, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Contact</Label>
                    <Select
                      value={selectedContact.preferredContact}
                      onValueChange={(value: ContactMethod) =>
                        setSelectedContact({ ...selectedContact, preferredContact: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={selectedContact.notes}
                    onChange={(e) =>
                      setSelectedContact({ ...selectedContact, notes: e.target.value })
                    }
                    rows={8}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Documents */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Documents</h3>
                  <Card className="p-4">
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {selectedContact.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm truncate max-w-[150px]">
                                {doc.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => window.open(doc.url, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deleteDocument(selectedContact.id, doc.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {selectedContact.documents.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No documents yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                    <label className="mt-4 flex items-center justify-center w-full p-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(selectedContact.id, e)}
                      />
                      <Upload className="h-4 w-4 mr-2" />
                      <span className="text-sm">Upload Document</span>
                    </label>
                  </Card>
                </div>

                {/* Follow-up */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Follow-up</h3>
                  <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Last Contact</Label>
                      <Input
                        type="date"
                        value={format(parseISO(selectedContact.lastContact), "yyyy-MM-dd")}
                        onChange={(e) =>
                          setSelectedContact({
                            ...selectedContact,
                            lastContact: new Date(e.target.value).toISOString(),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Next Follow-up</Label>
                      <Input
                        type="date"
                        value={
                          selectedContact.nextFollowUp
                            ? format(parseISO(selectedContact.nextFollowUp), "yyyy-MM-dd")
                            : ""
                        }
                        onChange={(e) =>
                          setSelectedContact({
                            ...selectedContact,
                            nextFollowUp: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          })
                        }
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedContact(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateContact(selectedContact.id, selectedContact);
                  setSelectedContact(null);
                  setNotification({ type: 'success', message: 'Contact updated successfully' });
                }}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}