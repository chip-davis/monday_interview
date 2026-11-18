import { useState } from "react";
import { Button, Dropdown, Heading, NumberField, TextField } from "@vibe/core";
import "@vibe/core/tokens";

export type Option = { label: string; value: string };

const CANDLE_COUNT = 3;

export default function OrderForm({ options }: { options: Option[] }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [quantity, setQuantity] = useState<number | null>(1);
  const [candles, setCandles] = useState<(Option | null)[]>(Array(CANDLE_COUNT).fill(null));

  const setCandle = (index: number, option: Option | null) =>
    setCandles((prev) => prev.map((c, i) => (i === index ? option : c)));

  const optionsFor = (index: number) =>
    options.map((o) => ({
      ...o,
      disabled: candles.some((c, i) => i !== index && c?.value === o.value),
    }));

  const canSubmit =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    quantity !== null &&
    quantity >= 1 &&
    candles.every((c) => c !== null);

  const startOrder = () => {
    console.log({ firstName, lastName, quantity, fragrances: candles.map((c) => c?.value) });
  };

  return (
    <>
      <Heading type="h2">Order Maker</Heading>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <TextField title="First Name" value={firstName} onChange={setFirstName} required />
        </div>
        <div style={{ flex: 1 }}>
          <TextField title="Last Name" value={lastName} onChange={setLastName} required />
        </div>
      </div>

      <NumberField id="quantity" label="Number of kits" value={quantity} onChange={setQuantity} min={1} required />

      {candles.map((candle, i) => (
        <Dropdown
          key={i}
          id={`candle-${i + 1}`}
          label={`Candle ${i + 1} - Fragrance`}
          placeholder="Select a fragrance..."
          options={optionsFor(i)}
          value={candle ?? undefined}
          onChange={(option: Option) => setCandle(i, option)}
          onClear={() => setCandle(i, null)}
          clearable
        />
      ))}

      <Button
        onClick={startOrder}
        disabled={!canSubmit}
        style={{ width: "100%" }}
      >
        Start Order
      </Button>
    </>
  );
}
