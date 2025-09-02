import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Insights } from "./insights.tsx";

const TEST_INSIGHTS = [
  {
    id: 1,
    brand: 1,
    createdAt: "2023-10-10T10:00:00Z",
    text: "Test insight",
  },
  { id: 1, brand: 2, createdAt: "2023-10-10T10:00:00Z", text: "Another test insight" },
];

describe("insights", () => {
  it("renders", () => {
    const { getByText } = render(<Insights insights={TEST_INSIGHTS} />);
    expect(getByText(TEST_INSIGHTS[0].text)).toBeTruthy();
  });
});
