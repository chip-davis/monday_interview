import { useState, type ReactElement } from "react";
import {
  Dropdown,
  Heading,
  MultiStepIndicator,
  NumberField,
  Steps,
  Text,
  TextArea,
  TextField,
  type StepStatus,
} from "@vibe/core";
import "@vibe/core/tokens";
import { useMutation } from "@tanstack/react-query";
import { createOrder, monday } from "./monday";

export type Option = { label: string; value: string; category: string };

const CANDLE_COUNT = 3;

const INSCRIPTION_MAX = 24;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEP_TITLES = [
  { titleText: "Customer", subtitleText: "Contact & shipping" },
  { titleText: "Candles", subtitleText: "Boxes & fragrances" },
  { titleText: "Review", subtitleText: "Confirm order" },
];

const stack = { display: "flex", flexDirection: "column", gap: 16 } as const;
const row = { display: "flex", gap: 12 } as const;

export default function OrderForm({ options }: { options: Option[] }) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [quantity, setQuantity] = useState<number | null>(1);
  const [candles, setCandles] = useState<(Option | null)[]>(
    Array(CANDLE_COUNT).fill(null),
  );
  const [inscription, setInscription] = useState("");

  const emailValid = EMAIL_PATTERN.test(email.trim());

  const stepValid = [
    firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      emailValid &&
      phone.trim() !== "" &&
      shippingAddress.trim() !== "",
    quantity !== null && quantity >= 1 && candles.every((c) => c !== null),
    true,
  ];

  const firstInvalidStep = stepValid.indexOf(false);
  const furthestReachable =
    firstInvalidStep === -1 ? STEP_TITLES.length - 1 : firstInvalidStep;

  const goTo = (index: number) => setStep(Math.min(index, furthestReachable));

  const order = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      monday.execute("notice", {
        message: "Order created",
        type: "success",
        timeout: 3000,
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setShippingAddress("");
      setQuantity(1);
      setCandles(Array(CANDLE_COUNT).fill(null));
      setInscription("");
      setStep(0);
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

  const startOrder = () => {
    if (quantity === null || firstInvalidStep !== -1) return;
    order.mutate({
      firstName,
      lastName,
      quantity,
      candles: candles.map((c) => ({ name: c!.label, category: c!.category })),
      inscription,
      email,
      phone,
      shippingAddress,
    });
  };

  const statusOf = (index: number): StepStatus =>
    index === step ? "active" : index < step ? "fulfilled" : "pending";

  const customerStep = (
    <div style={stack}>
      <div style={row}>
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
      <div style={row}>
        <div style={{ flex: 1 }}>
          <TextField
            title="Email"
            type="email"
            value={email}
            onChange={setEmail}
            validation={
              email.trim() !== "" && !emailValid
                ? { status: "error", text: "Enter a valid email address" }
                : undefined
            }
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            title="Phone"
            type="tel"
            placeholder="(901) 834-4495"
            value={phone}
            onChange={setPhone}
            required
          />
        </div>
      </div>
      <TextArea
        label="Shipping Address"
        placeholder="225 Park Avenue South, New York, NY 10003"
        value={shippingAddress}
        onChange={(e) => setShippingAddress(e.target.value)}
        resize={false}
        required
      />
    </div>
  );

  const candlesStep = (
    <div style={stack}>
      <NumberField
        id="quantity"
        label="Number of boxes"
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
          value={candle as Option}
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
    </div>
  );

  const summary: [string, string][] = [
    ["Customer", `${firstName.trim()} ${lastName.trim()}`],
    ["Email", email.trim()],
    ["Phone", phone.trim()],
    ["Ship to", shippingAddress.trim()],
    ["Boxes", String(quantity ?? "")],
    ...candles.map((c, i): [string, string] => [
      `Candle ${i + 1}`,
      c ? `${c.label} (${c.category})` : "—",
    ]),
    ["Inscription", inscription.trim() || "—"],
  ];

  const reviewStep = (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "max-content 1fr",
        gap: "8px 16px",
        margin: 0,
      }}
    >
      {summary.map(([label, value]) => (
        <div key={label} style={{ display: "contents" }}>
          <dt>
            <Text type="text2" color="secondary">
              {label}
            </Text>
          </dt>
          <dd style={{ margin: 0, whiteSpace: "pre-line" }}>
            <Text type="text1" ellipsis={false}>
              {value}
            </Text>
          </dd>
        </div>
      ))}
    </dl>
  );

  const steps: ReactElement[] = [customerStep, candlesStep, reviewStep];

  return (
    <div style={{ ...stack, gap: 24 }}>
      <Heading type="h2">New Production Order</Heading>

      <MultiStepIndicator
        className="order-steps"
        size="compact"
        steps={STEP_TITLES.map((s, i) => ({ ...s, status: statusOf(i) }))}
        onClick={(stepNumber) => goTo(stepNumber - 1)}
      />

      <Steps
        type="numbers"
        isContentOnTop
        steps={steps}
        activeStepIndex={step}
        onChangeActiveStep={(_, index) => goTo(index)}
        nextButtonProps={{ disabled: !stepValid[step] }}
        finishButtonProps={{
          children: "Start Order",
          disabled: firstInvalidStep !== -1,
          loading: order.isPending,
        }}
        onFinish={startOrder}
      />
    </div>
  );
}
