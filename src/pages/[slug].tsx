import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { createServerSideHelpers } from '@trpc/react-query/server';
import { GetStaticPropsContext } from 'next';
import superjson from 'superjson';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { PageLayout } from "~/components/layout";
import Image from "next/image";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div>404</div>

  return (
    <div>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile pic`}
            width={128}
            height={128}
            className="-mb-[64px] rounded-full border-2 border-black bg-black absolute bottom-0 left-0 ml-4"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${data.username ?? ""}`}</div>
        <div className="border-b border-slate-400 w-full" />
      </PageLayout>
    </div>
  );
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ slug: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });
  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
}

export const getStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
}

export default ProfilePage;
