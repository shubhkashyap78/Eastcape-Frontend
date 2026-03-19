import ListingPage from "./ListingPage";

export default function PackagesPage() {
  return (
    <ListingPage
      type="package"
      title="Packages"
      icon="📦"
      heroImg="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
      heroTagline="All-inclusive holiday packages combining flights, hotels and tours in Mauritius."
      emptyMsg="No packages listed yet — check back soon!"
    />
  );
}
