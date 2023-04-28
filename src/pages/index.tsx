import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { LoadingPage, LoadingSpinner } from "~/components/loading"
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Try again later!")
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex gap-3 w-full">
      <Image src={user.profileImageUrl} alt='Profile image' className="w-14 h-14 rounded-full" width={56} height={56} />
      <input
        placeholder="Type some emojis!"
        className="bg-transparent grow outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting} />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>)}
      {isPosting && <div className="flex justify-center items-center"><LoadingSpinner size={20} /></div>}
    </div>);
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex p-8 border-b border-slate-400 gap-3">
      <Image src={author.profileImageUrl} alt='Profile image' className="w-14 h-14 rounded-full" width={56} height={56} />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <span>{`@${author.username}`}</span><span className="font-thin">{`~ ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>);
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>

  return (<div className="flex flex-col text-xl">
    {data.map((fullPost) => (<PostView {...fullPost} key={fullPost.post.id} />))}
  </div>);
}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="h-full w-full md:max-w-2xl border-slate-400 border-x">
          <div className="border-b border-slate-400 p-4 flex">
            {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
