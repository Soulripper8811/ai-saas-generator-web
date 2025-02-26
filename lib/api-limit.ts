import { auth } from "@clerk/nextjs/server";
import prismadb from "./prismadb";
import { MAX_FREE_COUNT } from "./constant";

export const increaseApiLimit = async () => {
  const { userId } = await auth();
  if (!userId) return;
  const userApiLimit = await prismadb.userApiLimit.findFirst({
    where: {
      userId,
    },
  });

  if (userApiLimit) {
    await prismadb.userApiLimit.update({
      where: {
        userId,
      },
      data: {
        count: userApiLimit.count + 1,
      },
    });
  } else {
    await prismadb.userApiLimit.create({
      data: {
        userId,
        count: 1,
      },
    });
  }
};

export const checkApiLimit = async () => {
  const { userId } = await auth();
  if (!userId) return;
  const userApiLimit = await prismadb.userApiLimit.findFirst({
    where: {
      userId,
    },
  });
  if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNT) {
    return true;
  }
  return false;
};

export const getApiLimitCount = async () => {
  const { userId } = await auth();
  if (!userId) return;
  const userApiLimit = await prismadb.userApiLimit.findFirst({
    where: {
      userId,
    },
  });
  if (!userApiLimit) return 0;
  return userApiLimit.count;
};
