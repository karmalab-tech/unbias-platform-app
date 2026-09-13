import { useParams, useSearchParams } from "react-router-dom";
import { useContribution } from "~/components/contribute/ContributionContext";

// Resolves the :index (1-based) route param to a photo and its neighbours.
export default function usePhoto() {
  const { index, person } = useParams();
  const [search] = useSearchParams();
  const { photos } = useContribution();
  const photoIndex = Number(index) - 1;
  const personIndex = person ? Number(person) - 1 : null;
  return {
    photos,
    photoIndex,
    personIndex,
    asset: photos[photoIndex] ?? null,
    fromReview: search.get("from") === "review",
  };
}
