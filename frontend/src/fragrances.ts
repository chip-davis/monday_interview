export type Fragrance = {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  image_url: string;
};

export const sampleFragrances: Fragrance[] = [
  {
    id: "1",
    name: "Herb Garden",
    description: "A refreshing fragrance that captures the essence of an aromatic herb garden.",
    category: "Herbaceous",
    created_at: "2022-03-15T09:37:22Z",
    updated_at: "2022-04-20T15:14:56Z",
    image_url: "https://example.com/herb_garden.jpg",
  },
  {
    id: "2",
    name: "Citrus Grove",
    description: "Bright notes of lemon, bergamot and sweet orange.",
    category: "Citrus",
    created_at: "2022-05-02T11:20:00Z",
    updated_at: "2022-06-10T08:45:12Z",
    image_url: "https://example.com/citrus_grove.jpg",
  },
];
