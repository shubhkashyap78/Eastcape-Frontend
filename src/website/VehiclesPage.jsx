import ListingPage from "./ListingPage";

export default function VehiclesPage() {
  return (
    <ListingPage
      type="vehicle"
      title="Vehicles"
      icon="🚗"
      heroImg="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=80"
      heroTagline="Car rentals, transfers and private transport across Mauritius."
      emptyMsg="No vehicles listed yet — check back soon!"
    />
  );
}
