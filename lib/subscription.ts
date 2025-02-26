import { auth } from "@clerk/nextjs/server";
import prismadb from "./prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const { userId } = await auth();
  if (!userId) return false;
  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId,
    },
    select: {
      stripeCurrentPeriodEnd: true,
      stripePriceId: true,
      stripeSubscriptionId: true,
      stripeCustomerId: true,
    },
  });
  if (!userSubscription) return false;
  console.log(
    "date hu subscription ki",
    userSubscription?.stripeCurrentPeriodEnd?.getTime()!
  );
  const isValid =
    userSubscription?.stripePriceId &&
    userSubscription?.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
      Date.now();

  return !!isValid;
};
