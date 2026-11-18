import { useState } from "react";
import { Dropdown } from "@vibe/core";

type Option = { label: string; value: string };

type Props = {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
};

export default function CategoryDropdown({ categories, value, onChange }: Props) {
  const [input, setInput] = useState("");

  const typed = input.trim();
  const isNew =
    typed !== "" &&
    !categories.some((c) => c.toLowerCase() === typed.toLowerCase());

  const options: Option[] = [
    ...categories.map((c) => ({ label: c, value: c })),
    ...(isNew ? [{ label: `Create "${typed}"`, value: typed }] : []),
  ];

  const selected: Option | null = value ? { label: value, value } : null;

  return (
    <Dropdown
      id="fragrance-category"
      label="Category"
      placeholder="Select or type a new category"
      options={options}
      value={selected as Option}
      onInputChange={(text) => setInput(text ?? "")}
      onChange={(option: Option) => onChange(option.value)}
      onClear={() => onChange("")}
      searchable
      clearable
      required
    />
  );
}
