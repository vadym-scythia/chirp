import { GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({ username: "vadym-scythia" });

  if (isLoading) return <div>Loading...</div>

  if (!data) return <div>404</div>

  console.log(data);

  return (
    <div>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex justify-center h-screen">
        <div>{data.username}</div>
      </main>
    </div>
  );
};

import { createServerSideHelpers } from '@trpc/react-query/server';
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next';
import superjson from 'superjson';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";

export async function getStaticProps(
  context: GetStaticPropsContext<{ slug: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {prisma, userId: null},
    transformer: superjson, 
  });

  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("no slug");

  await helpers.profile.getUserByUsername.prefetch({ username: slug });
  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}

export const getStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
}

export default ProfilePage;
