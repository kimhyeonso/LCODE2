export const myStoryTrips = ["후쿠오카 3박 4일"];
export const shoppingReviewLimit = 4;

export function getMyStoriesCount(productCount) {
  return myStoryTrips.length + Math.min(productCount, shoppingReviewLimit);
}
