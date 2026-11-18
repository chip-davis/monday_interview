import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  EmptyState,
  IconButton,
  Modal,
  ModalBasicLayout,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  TextArea,
  TextField,
  type TableColumn,
} from "@vibe/core";
import { Add, Delete, Doc, Edit } from "@vibe/icons";
import {
  getListFragrancesQueryKey,
  useCreateFragrance,
  useDeleteFragrance,
  useListFragrances,
  useUpdateFragrance,
} from "./api/gen";
import type { Fragrance, FragranceCreate } from "./api/gen/model";
import { monday } from "./monday";
import ConnectPrompt from "./ConnectPrompt";
import CategoryDropdown from "./CategoryDropdown";
import { isOAuthRequired } from "./api/fetcher";

const EMPTY_FORM: Required<FragranceCreate> = {
  name: "",
  category: "",
  description: "",
  image_url: "",
  recipe: "",
};

type SortKey = "name" | "category";
type SortDirection = "asc" | "desc" | "none";

const isSortKey = (id: string): id is SortKey =>
  id === "name" || id === "category";

const COLUMNS: TableColumn[] = [
  { id: "name", title: "Name", width: "1fr" },
  { id: "category", title: "Category", width: "140px" },
  { id: "description", title: "Description", width: "2fr" },
  { id: "actions", title: "", width: "120px" },
];

const notify = (message: string, type: "success" | "error") =>
  monday.execute("notice", { message, type, timeout: 3000 });

export default function FragranceManager() {
  const queryClient = useQueryClient();
  const {
    data: fragrances = [],
    isPending,
    isError,
    error,
  } = useListFragrances({
    query: { select: (res) => res.data },
  });

  const [editing, setEditing] = useState<Fragrance | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Fragrance | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Required<FragranceCreate>>(EMPTY_FORM);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "category",
    direction: "none",
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: getListFragrancesQueryKey() });

  const onError = (e: Error) => {
    console.error(e);
    notify("Something went wrong. Please try again.", "error");
  };

  const closeModal = () => setModalOpen(false);

  const create = useCreateFragrance({
    mutation: {
      onSuccess: async () => {
        await refresh();
        closeModal();
        notify("Fragrance added", "success");
      },
      onError,
    },
  });

  const update = useUpdateFragrance({
    mutation: {
      onSuccess: async () => {
        await refresh();
        closeModal();
        notify("Fragrance updated", "success");
      },
      onError,
    },
  });

  const remove = useDeleteFragrance({
    mutation: {
      onSuccess: async () => {
        await refresh();
        notify("Fragrance deleted", "success");
      },
      onError,
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (fragrance: Fragrance) => {
    setEditing(fragrance);
    setForm({
      name: fragrance.name,
      category: fragrance.category,
      description: fragrance.description,
      image_url: fragrance.image_url,
      recipe: fragrance.recipe ?? "",
    });
    setModalOpen(true);
  };

  const confirmDelete = async (fragrance: Fragrance) => {
    const { data } = await monday.execute("confirm", {
      message: `Delete "${fragrance.name}"? Existing orders keep their fragrance names.`,
      confirmButton: "Delete",
      cancelButton: "Cancel",
    });
    if (data.confirm) remove.mutate({ fragranceId: fragrance.id });
  };

  const setField = (field: keyof Required<FragranceCreate>) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const trimmed: FragranceCreate = {
    name: form.name.trim(),
    category: form.category.trim(),
    description: form.description.trim(),
    image_url: form.image_url.trim(),
    recipe: form.recipe.trim(),
  };
  const formValid = trimmed.name !== "" && trimmed.category !== "";
  const saving = create.isPending || update.isPending;

  const save = () => {
    if (!formValid) return;
    if (editing) {
      update.mutate({ fragranceId: editing.id, data: trimmed });
    } else {
      create.mutate({ data: trimmed });
    }
  };

  const categories = [...new Set(fragrances.map((f) => f.category))].sort(
    (a, b) => a.localeCompare(b),
  );

  const byDefault = (a: Fragrance, b: Fragrance) =>
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name);

  const sorted = [...fragrances].sort((a, b) => {
    if (sort.direction === "none") return byDefault(a, b);
    const order = a[sort.key].localeCompare(b[sort.key]) || byDefault(a, b);
    return sort.direction === "asc" ? order : -order;
  });

  const sortStateFor = (key: SortKey): SortDirection =>
    sort.key === key ? sort.direction : "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text type="text2" color="secondary">
          {fragrances.length} fragrances
        </Text>
        <Button leftIcon={Add} onClick={openCreate}>
          Add fragrance
        </Button>
      </div>

      <Table
        columns={COLUMNS}
        dataState={{ isLoading: isPending, isError }}
        errorState={
          isOAuthRequired(error) ? (
            <ConnectPrompt />
          ) : (
            <EmptyState
              title="Couldn't load fragrances"
              description="Refresh the view to try again."
            />
          )
        }
        emptyState={
          <EmptyState
            title="No fragrances yet"
            description="Add the first fragrance to start taking orders."
          />
        }
      >
        <TableHeader>
          {COLUMNS.map(({ id, title }) =>
            isSortKey(id) ? (
              <TableHeaderCell
                key={id}
                title={title}
                sortState={sortStateFor(id)}
                onSortClicked={(direction) => setSort({ key: id, direction })}
              />
            ) : (
              <TableHeaderCell key={id} title={title} />
            ),
          )}
        </TableHeader>
        <TableBody>
          {sorted.map((f) => (
            <TableRow key={f.id}>
              <TableCell>{f.name}</TableCell>
              <TableCell>{f.category}</TableCell>
              <TableCell>{f.description}</TableCell>
              <TableCell>
                <IconButton
                  icon={Doc}
                  aria-label={`View recipe for ${f.name}`}
                  tooltipContent="View recipe"
                  size="small"
                  onClick={() => setViewingRecipe(f)}
                />
                <IconButton
                  icon={Edit}
                  aria-label={`Edit ${f.name}`}
                  tooltipContent="Edit"
                  size="small"
                  onClick={() => openEdit(f)}
                />
                <IconButton
                  icon={Delete}
                  aria-label={`Delete ${f.name}`}
                  tooltipContent="Delete"
                  size="small"
                  loading={
                    remove.isPending &&
                    remove.variables?.fragranceId === f.id
                  }
                  onClick={() => confirmDelete(f)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal id="fragrance-modal" show={modalOpen} onClose={closeModal}>
        <ModalBasicLayout>
          <ModalHeader title={editing ? "Edit fragrance" : "Add fragrance"} />
          <ModalContent>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <TextField
                title="Name"
                value={form.name}
                onChange={setField("name")}
                required
              />
              <CategoryDropdown
                categories={categories}
                value={form.category}
                onChange={setField("category")}
              />
              <TextArea
                label="Description"
                value={form.description}
                onChange={(e) => setField("description")(e.target.value)}
                resize={false}
              />
              <TextField
                title="Image URL"
                type="url"
                value={form.image_url}
                onChange={setField("image_url")}
              />
              <TextArea
                label="Recipe"
                placeholder={
                  "1 drop basil. 2 drops rosemary."
                }
                value={form.recipe}
                onChange={(e) => setField("recipe")(e.target.value)}
              />
            </div>
          </ModalContent>
        </ModalBasicLayout>
        <ModalFooter
          primaryButton={{
            text: editing ? "Save changes" : "Add fragrance",
            onClick: save,
            disabled: !formValid,
            loading: saving,
          }}
          secondaryButton={{ text: "Cancel", onClick: closeModal }}
        />
      </Modal>

      <Modal
        id="recipe-modal"
        show={viewingRecipe !== null}
        onClose={() => setViewingRecipe(null)}
      >
        <ModalBasicLayout>
          <ModalHeader
            title={viewingRecipe?.name ?? ""}
            description={viewingRecipe?.category ?? ""}
          />
          <ModalContent>
            {viewingRecipe?.recipe ? (
              <Text type="text1" ellipsis={false} style={{ whiteSpace: "pre-line" }}>
                {viewingRecipe.recipe}
              </Text>
            ) : (
              <Text type="text1" color="secondary">
                No recipe yet.
              </Text>
            )}
          </ModalContent>
        </ModalBasicLayout>
        <ModalFooter
          primaryButton={{
            text: "Close",
            onClick: () => setViewingRecipe(null),
          }}
          secondaryButton={{
            text: "Edit",
            onClick: () => {
              const fragrance = viewingRecipe;
              setViewingRecipe(null);
              if (fragrance) openEdit(fragrance);
            },
          }}
        />
      </Modal>
    </div>
  );
}
