/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import config from "@/config";
import { useRouter } from "next/navigation";

const ButtonSignin = ({ text = "SignIn", extraStyle, onOpenLoginModal}) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleClick = () => {
    if (status === "authenticated") {
      router.push(config.auth.callbackUrl);
    } else {
      // If onOpenLoginModal is provided (for in-page modals)
      if (onOpenLoginModal) {
        onOpenLoginModal('login');
      } else {
        // Otherwise redirect to the auth page that will show the modal
        router.push('/auth?mode=login');
      }
    }
  };

  if (status === "authenticated") {
    return (
      <Link
        href={config.auth.callbackUrl}
        className={`btn ${extraStyle ? extraStyle : ""}`}
      >
        {session.user?.image ? (
          <img
            src={session.user?.image}
            alt={session.user?.name || "Account"}
            className="w-6 h-6 rounded-full shrink-0"
            referrerPolicy="no-referrer"
            width={24}
            height={24}
          />
        ) : (
          <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
            {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
          </span>
        )}
        {session.user?.name || session.user?.email || "Account"}
      </Link>
    );
  }

  return (
      <button
        className={`btn ${extraStyle ? extraStyle : ""}`}
        onClick={handleClick}
      >
        {text}
      </button>
    );
};

export default ButtonSignin;