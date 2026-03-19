import ListingPage from "./ListingPage";

export default function HotelsPage() {
  return (
    <ListingPage
      type="hotel"
      title="Hotels"
      icon="🏨"
      heroImg="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80"
      heroTagline="Luxury stays and boutique retreats across the island of Mauritius."
      emptyMsg="No hotels listed yet — check back soon!"
    />
  );
}
