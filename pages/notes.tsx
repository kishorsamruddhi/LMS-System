"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Plus,
  Search,
  Folder,
  Star,
  StarOff,
  MoreVertical,
  Tag,
  Trash2,
  FolderPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNoteStore, Note } from "@/lib/store/note-store";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function NotesPage() {
  const { user } = useAuth();
  const { notes, folders, addNote, updateNote, deleteNote, addFolder } = useNoteStore();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    folder: "",
    tags: [] as string[],
  });

  const filteredNotes = notes.filter((note) => {
    const matchesFolder = !selectedFolder || note.folder === selectedFolder;
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleAddNote = () => {
    if (newNote.title && newNote.folder && user) {
      addNote({
        ...newNote,
        isFavorite: false,
        createdBy: user.uid,
      });
      setNewNote({
        title: "",
        content: "",
        folder: "",
        tags: [],
      });
      setIsNewNoteOpen(false);
    }
  };

  const handleAddFolder = () => {
    if (newFolder.trim()) {
      addFolder(newFolder.trim());
      setNewFolder("");
      setIsNewFolderOpen(false);
    }
  };

  const handleToggleFavorite = (note: Note) => {
    updateNote(note.id, { isFavorite: !note.isFavorite });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/20 p-4 hidden md:block">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Folders</h2>
            <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Folder name"
                    value={newFolder}
                    onChange={(e) => setNewFolder(e.target.value)}
                  />
                  <Button onClick={handleAddFolder} className="w-full">
                    Create Folder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            <Button
              variant={!selectedFolder ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedFolder(null)}
            >
              <Folder className="mr-2 h-4 w-4" />
              All Notes
            </Button>
            {folders.map((folder) => (
              <Button
                key={folder}
                variant={selectedFolder === folder ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedFolder(folder)}
              >
                <Folder className="mr-2 h-4 w-4" />
                {folder}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isNewNoteOpen} onOpenChange={setIsNewNoteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                  <Select
                    value={newNote.folder}
                    onValueChange={(value) => setNewNote({ ...newNote, folder: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder} value={folder}>
                          {folder}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Start writing..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={10}
                  />
                  <Button onClick={handleAddNote} className="w-full">
                    Create Note
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Notes Grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold truncate">{note.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(note.updatedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFavorite(note)}
                    >
                      {note.isFavorite ? (
                        <Star className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedNote(note)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteNote(note.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="text-sm line-clamp-3">{note.content}</div>
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-secondary px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Edit Note Dialog */}
        {selectedNote && (
          <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  value={selectedNote.title}
                  onChange={(e) =>
                    setSelectedNote({ ...selectedNote, title: e.target.value })
                  }
                />
                <Select
                  value={selectedNote.folder}
                  onValueChange={(value) =>
                    setSelectedNote({ ...selectedNote, folder: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={selectedNote.content}
                  onChange={(e) =>
                    setSelectedNote({ ...selectedNote, content: e.target.value })
                  }
                  rows={10}
                />
                <Button
                  onClick={() => {
                    updateNote(selectedNote.id, selectedNote);
                    setSelectedNote(null);
                  }}
                  className="w-full"
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}