import { useState } from "react";
import { Button, Dropdown, Heading, NumberField, TextField } from "@vibe/core";
import "@vibe/core/tokens";

export type Option = { label: string; value: string };

const MAX_SELECTED = 3;

export default function OrderForm({ options }: { options: Option[] }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [quantity, setQuantity] = useState<number | null>(1);
  const [selected, setSelected] = useState<Option[]>([]);

  const maxReached = selected.length >= MAX_SELECTED;
  const dropdownOptions = options.map((o) => ({
    ...o,
    disabled: maxReached && !selected.some((s) => s.value === o.value),
  }));

  const startOrder = () => {
    console.log({ firstName, lastName, quantity, selected: selected.map((s) => s.value) });
  };

  return (
    <>
      <Heading type="h2">Order Maker</Heading>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <TextField title="First Name" value={firstName} onChange={setFirstName} />
        </div>
        <div style={{ flex: 1 }}>
          <TextField title="Last Name" value={lastName} onChange={setLastName} />
        </div>
      </div>

      <NumberField id="quantity" label="Quantity" value={quantity} onChange={setQuantity} min={1} />

      <Dropdown
        id="fragrance-options"
        label="Fragrances"
        placeholder="Select..."
        multi
        options={dropdownOptions}
        value={selected}
        onChange={(values: Option[]) => {
          if (values.length <= MAX_SELECTED) setSelected(values);
        }}
      />

      <Button onClick={startOrder} style={{ width: "100%" }}>
        Start Order
      </Button>
    </>
  );
}
