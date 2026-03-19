import ListingPage from "./ListingPage";

export default function ToursPage() {
  return (
    <ListingPage
      type="tour"
      title="Tours"
      icon="🗺️"
      heroImg="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=80"
      heroTagline="Guided adventures, cultural experiences and island explorations in Mauritius."
      emptyMsg="No tours listed yet — check back soon!"
    />
  );
}
