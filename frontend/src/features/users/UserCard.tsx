import { ExternalUser } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

interface UserCardProps {
  user: ExternalUser;
  isSaved: boolean;
}

export function UserCard({ user, isSaved }: UserCardProps) {
  return (
    <Link href={`/users/${user.id}`} className="group block">
      <div className="relative border border-border rounded-lg p-5 transition-all duration-200 group-hover:border-amber-400 group-hover:shadow-sm bg-background overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />

        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <Image
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              width={52}
              height={52}
              className="w-13 h-13 rounded-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-base leading-tight text-foreground group-hover:text-amber-700 transition-colors duration-200 truncate">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
          </div>

          <div className="shrink-0">
            {isSaved ? (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                <Check className="h-3 w-3" />
                Saved
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/60">
                #{user.id}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
