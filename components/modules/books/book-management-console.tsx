"use client";

import { useState, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  PlusCircle,
  Search,
  Upload,
  CheckCircle2,
  AlertCircle,
  Barcode,
  Sparkles,
  Layers,
  FileText,
  Tag,
  Loader2,
  Calendar,
  ChevronDown,
  ChevronRight,
  QrCode,
  UserCheck,
  Clock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { ManageableBookItem } from "@/lib/services/book-management-service";
import {
  createBookAction,
  addBookCopyAction,
} from "@/app/actions/book-management-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

interface BookManagementConsoleProps {
  initialBooks: ManageableBookItem[];
}

const CATEGORY_PRESETS = [
  "Fiction",
  "Science & Tech",
  "History",
  "Biography",
  "Mathematics",
  "Literature",
  "Philosophy",
  "Computer Science",
];

export function BookManagementConsole({ initialBooks }: BookManagementConsoleProps) {
  const [books, setBooks] = useState<ManageableBookItem[]>(initialBooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);

  // Create Book Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState("Fiction");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [publicationYear, setPublicationYear] = useState<number | undefined>(new Date().getFullYear());
  const [initialCopyCount, setInitialCopyCount] = useState(1);
  const [initialCopyCondition, setInitialCopyCondition] = useState<"MINT" | "GOOD" | "FAIR" | "DAMAGED">("MINT");

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Add Copy Modal state
  const [selectedBookForCopy, setSelectedBookForCopy] = useState<ManageableBookItem | null>(null);
  const [customBarcode, setCustomBarcode] = useState("");
  const [copyCondition, setCopyCondition] = useState<"MINT" | "GOOD" | "FAIR" | "DAMAGED">("MINT");
  const [isAddingCopy, setIsAddingCopy] = useState(false);

  // Filter books
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.isbn && b.isbn.includes(searchQuery));
    const matchesCategory = selectedCategory === "all" || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle Cloudflare R2 image upload
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setModalError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      setCoverImageUrl(data.url);
      setModalSuccess("Cover image uploaded successfully to Cloudflare R2!");
      toast.success("Cover image uploaded successfully!");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to upload cover image.";
      setModalError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit new book creation
  const handleCreateBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    setModalSuccess(null);

    const res = await createBookAction({
      title,
      author,
      isbn: isbn || undefined,
      category,
      description: description || undefined,
      coverImageUrl: coverImageUrl || undefined,
      publicationYear: publicationYear ? Number(publicationYear) : undefined,
      initialCopyCount: Number(initialCopyCount),
      initialCopyCondition,
    });

    setIsSubmitting(false);

    if (!res.success) {
      const errMsg = res.error || "Failed to create book title.";
      setModalError(errMsg);
      toast.error(errMsg);
      return;
    }

    const msg = res.message || "Book created successfully!";
    setModalSuccess(msg);
    toast.success(msg);
    
    // Reset form after short delay
    setTimeout(() => {
      setIsCreateModalOpen(false);
      setTitle("");
      setAuthor("");
      setIsbn("");
      setDescription("");
      setCoverImageUrl("");
      setModalSuccess(null);
      window.location.reload();
    }, 1200);
  };

  // Submit adding physical copy
  const handleAddCopySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForCopy) return;

    setIsAddingCopy(true);
    setModalError(null);

    const res = await addBookCopyAction({
      bookId: selectedBookForCopy.id,
      barcode: customBarcode || undefined,
      condition: copyCondition,
    });

    setIsAddingCopy(false);

    if (!res.success) {
      const errMsg = res.error || "Failed to add copy.";
      setModalError(errMsg);
      toast.error(errMsg);
      return;
    }

    const msg = res.message || "Copy added successfully!";
    setModalSuccess(msg);
    toast.success(msg);

    setTimeout(() => {
      setSelectedBookForCopy(null);
      setCustomBarcode("");
      setModalSuccess(null);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Control Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            Book Catalog Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register new book titles, manage physical copies, generate barcodes, and link cover imagery.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 font-semibold px-5 gap-2 text-xs shadow-xs"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add New Book Title</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              selectedCategory === "all"
                ? "bg-foreground text-background font-semibold"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            All Categories ({books.length})
          </button>
          {CATEGORY_PRESETS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-foreground text-background font-semibold"
                  : "bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {filteredBooks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-medium text-foreground">No matching book titles found</p>
            <p className="text-xs text-muted-foreground">
              Click &ldquo;Add New Book Title&rdquo; to add a title to the library catalog.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-mono">
                <tr>
                  <th className="p-4">Book Title &amp; Author</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">ISBN</th>
                  <th className="p-4">Total Copies</th>
                  <th className="p-4">Available</th>
                  <th className="p-4">Borrowed</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBooks.map((b) => {
                  const isExpanded = expandedBookId === b.id;
                  return (
                    <Fragment key={b.id}>
                      <tr
                        key={b.id}
                        className={`hover:bg-accent/40 transition-colors cursor-pointer ${
                          isExpanded ? "bg-accent/30" : ""
                        }`}
                        onClick={() => setExpandedBookId(isExpanded ? null : b.id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedBookId(isExpanded ? null : b.id);
                              }}
                              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title={isExpanded ? "Collapse Copies" : "View Physical Copies & Barcodes"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-brand-blue" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>

                            <div className="relative h-12 w-9 rounded-md bg-muted overflow-hidden shrink-0 border border-border">
                              {b.coverImageUrl ? (
                                <Image
                                  src={b.coverImageUrl}
                                  alt={b.title}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-brand-yellow/20 text-brand-yellow">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/books/${b.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold text-foreground hover:text-brand-blue hover:underline"
                              >
                                {b.title}
                              </Link>
                              <p className="text-[11px] text-muted-foreground">by {b.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium">{b.category}</td>
                        <td className="p-4 font-mono text-[11px] text-muted-foreground">
                          {b.isbn || "—"}
                        </td>
                        <td className="p-4 font-mono font-bold text-foreground">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedBookId(isExpanded ? null : b.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted hover:bg-accent text-foreground transition-colors"
                          >
                            <span>{b.totalCopies} copies</span>
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3 text-brand-blue" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[11px]">
                            {b.availableCopies} free
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold font-mono text-[11px]">
                            {b.borrowedCopies} out
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setExpandedBookId(isExpanded ? null : b.id)}
                              className="rounded-full text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                            >
                              <QrCode className="h-3.5 w-3.5 text-brand-blue" />
                              {isExpanded ? "Hide Copies" : "View Barcodes"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedBookForCopy(b)}
                              className="rounded-full text-[11px] gap-1 hover:bg-accent"
                            >
                              <PlusCircle className="h-3.5 w-3.5 text-brand-blue" />
                              Add Copy
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Physical Copies & Barcodes Drawer */}
                      {isExpanded && (
                        <tr key={`${b.id}-drawer`} className="bg-muted/30 border-b border-border/80">
                          <td colSpan={7} className="p-4 sm:p-6">
                            <div className="space-y-4 bg-card p-5 rounded-2xl border border-border shadow-xs">
                              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border pb-3">
                                <div>
                                  <h4 className="font-bold text-sm font-display text-foreground flex items-center gap-2">
                                    <QrCode className="h-4 w-4 text-brand-blue" />
                                    Registered Physical Copies & Barcodes for &ldquo;{b.title}&rdquo;
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Physical book inventory items registered under this title catalog record.
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedBookForCopy(b)}
                                  className="rounded-full text-xs font-semibold bg-brand-blue text-white hover:bg-brand-blue/90 gap-1.5 h-8"
                                >
                                  <PlusCircle className="h-3.5 w-3.5" />
                                  Add Copy to Title
                                </Button>
                              </div>

                              {b.copies.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground text-xs italic">
                                  No physical copies currently registered for this book title.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {b.copies.map((copy) => (
                                    <div
                                      key={copy.id}
                                      className="p-3.5 rounded-xl border border-border bg-accent/30 hover:bg-accent/60 transition-colors space-y-2 flex flex-col justify-between"
                                    >
                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border flex items-center gap-1.5">
                                            <Barcode className="h-3.5 w-3.5 text-brand-blue shrink-0" />
                                            {copy.barcode}
                                          </span>
                                          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-accent border text-muted-foreground">
                                            {copy.condition}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-1">
                                          <span className="text-xs text-muted-foreground font-medium">
                                            Copy Status:
                                          </span>
                                          {copy.status === "AVAILABLE" && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                              Available on Shelf
                                            </span>
                                          )}
                                          {copy.status === "BORROWED" && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                                              <UserCheck className="w-3 h-3 text-blue-500 shrink-0" />
                                              Book In Hand
                                            </span>
                                          )}
                                          {copy.status === "RESERVED" && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                              <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                              Reserved Hold
                                            </span>
                                          )}
                                        </div>

                                        {copy.currentHolderName && (
                                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 pt-1 flex items-center gap-1">
                                            <UserCheck className="w-3.5 h-3.5 shrink-0" /> 👤 Holder: {copy.currentHolderName}
                                          </p>
                                        )}
                                      </div>

                                      <div className="pt-2 border-t border-border/60 flex justify-end">
                                        <Link
                                          href={`/assistant/circulation?tab=history&barcode=${encodeURIComponent(copy.barcode)}`}
                                          className="text-[11px] font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
                                        >
                                          Inspect Traceability <ArrowRight className="h-3 w-3" />
                                        </Link>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NEW BOOK DIALOG MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-yellow" />
                  Add New Book Title to Catalog
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter title details, category, and initial physical copy counts.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateBookSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Book Title *</label>
                  <Input
                    required
                    placeholder="e.g. To Kill a Mockingbird"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Author *</label>
                  <Input
                    required
                    placeholder="e.g. Harper Lee"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">ISBN (Optional)</label>
                  <Input
                    placeholder="e.g. 978-0061120084"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Publication Year</label>
                  <Input
                    type="number"
                    value={publicationYear || ""}
                    onChange={(e) => setPublicationYear(e.target.value ? Number(e.target.value) : undefined)}
                    className="text-xs rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Book Description</label>
                <textarea
                  rows={3}
                  placeholder="Summary of the book..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Cover Image Upload (Cloudflare R2 or Public URL) */}
              <div className="space-y-2 border-t border-border pt-3">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Cover Image (Cloudflare R2 Upload or Image URL)</span>
                  {coverImageUrl && <span className="text-[10px] text-emerald-500 font-mono">✓ Image Linked</span>}
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Input
                    placeholder="https://pub-r2.dev/covers/book.jpg"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="text-xs rounded-xl flex-1"
                  />

                  <label className="cursor-pointer shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="h-9 px-4 rounded-full bg-accent hover:bg-accent/80 text-foreground text-xs font-semibold flex items-center gap-1.5 border border-border">
                      {isUploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5 text-brand-blue" />
                      )}
                      <span>Upload to R2</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Initial Copies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Initial Copy Count *</label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={initialCopyCount}
                    onChange={(e) => setInitialCopyCount(Number(e.target.value))}
                    className="text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Physical Copy Condition *</label>
                  <select
                    value={initialCopyCondition}
                    onChange={(e) => setInitialCopyCondition(e.target.value as "MINT" | "GOOD" | "FAIR" | "DAMAGED")}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="MINT">MINT (Brand New)</option>
                    <option value="GOOD">GOOD (Light Usage)</option>
                    <option value="FAIR">FAIR (Worn)</option>
                    <option value="DAMAGED">DAMAGED (Needs Maintenance)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 text-xs font-semibold gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Create Title &amp; Physical Copies
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PHYSICAL COPY DIALOG MODAL */}
      {selectedBookForCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Barcode className="h-5 w-5 text-brand-blue" />
                  Add Physical Copy
                </h2>
                <p className="text-xs text-muted-foreground">
                  Adding copy to: <strong className="text-foreground">{selectedBookForCopy.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedBookForCopy(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddCopySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Barcode / RFID Identifier (Leave blank to auto-generate)
                </label>
                <Input
                  placeholder="e.g. BC-849201-1"
                  value={customBarcode}
                  onChange={(e) => setCustomBarcode(e.target.value)}
                  className="text-xs rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Initial Condition</label>
                <select
                  value={copyCondition}
                  onChange={(e) => setCopyCondition(e.target.value as "MINT" | "GOOD" | "FAIR" | "DAMAGED")}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs"
                >
                  <option value="MINT">MINT (Brand New)</option>
                  <option value="GOOD">GOOD (Light Usage)</option>
                  <option value="FAIR">FAIR (Worn)</option>
                  <option value="DAMAGED">DAMAGED (Needs Repair)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedBookForCopy(null)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingCopy}
                  className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 text-xs font-semibold gap-2"
                >
                  {isAddingCopy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <PlusCircle className="h-4 w-4" />
                  )}
                  <span>Register Physical Copy</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
