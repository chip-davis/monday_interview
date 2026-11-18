import { useState } from "react";
import {
  Button,
  Dropdown,
  Heading,
  NumberField,
  TextField,
  TextArea,
} from "@vibe/core";
import "@vibe/core/tokens";
import { useMutation } from "@tanstack/react-query";
import { createOrder, monday } from "./monday";

export type Option = { label: string; value: string; category: string };

const CANDLE_COUNT = 3;

const INSCRIPTION_MAX = 24;

export default function OrderForm({ options }: { options: Option[] }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [quantity, setQuantity] = useState<number | null>(1);
  const [candles, setCandles] = useState<(Option | null)[]>(
    Array(CANDLE_COUNT).fill(null),
  );
  const [inscription, setInscription] = useState("");

  const order = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      monday.execute("notice", {
        message: "Order created",
        type: "success",
        timeout: 3000,
      });
      setCandles(Array(CANDLE_COUNT).fill(null));
      setInscription("");
    },
    onError: (e) => {
      console.error(e);
      monday.execute("notice", {
        message: "Couldn't create the order.",
        type: "error",
      });
    },
  });

  const setCandle = (index: number, option: Option | null) =>
    setCandles((prev) => prev.map((c, i) => (i === index ? option : c)));

  const optionsFor = (index: number) => {
    const groups = new Map<string, Option[]>();
    for (const o of options) {
      const option = {
        ...o,
        disabled: candles.some((c, i) => i !== index && c?.value === o.value),
      };
      groups.set(o.category, [...(groups.get(o.category) ?? []), option]);
    }
    return [...groups]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, options]) => ({ label, options }));
  };

  const canSubmit =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    quantity !== null &&
    quantity >= 1 &&
    candles.every((c) => c !== null);

  const startOrder = () => {
    order.mutate({
      firstName,
      lastName,
      quantity,
      candles: candles.map((c) => ({ name: c!.label, category: c!.category })),
      inscription,
    });
  };

  return (
    <>
      <Heading type="h2">Order Maker</Heading>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <TextField
            title="First Name"
            value={firstName}
            onChange={setFirstName}
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            title="Last Name"
            value={lastName}
            onChange={setLastName}
            required
          />
        </div>
      </div>

      <NumberField
        id="quantity"
        label="Number of kits"
        value={quantity}
        onChange={setQuantity}
        min={1}
        required
      />

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
          withGroupDivider
        />
      ))}

      <TextArea
        label="Inscription (optional)"
        placeholder="Free smells"
        value={inscription}
        onChange={(e) => setInscription(e.target.value)}
        maxLength={INSCRIPTION_MAX}
        showCharCount
        resize={false}
      />

      <Button
        onClick={startOrder}
        disabled={!canSubmit}
        loading={order.isPending}
        style={{ width: "100%" }}
      >
        Start Order
      </Button>
    </>
  );
}
