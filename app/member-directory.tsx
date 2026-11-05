"use client";

import type { FormEvent } from "react";
import { deleteMember } from "@/app/actions";
import type { LibraryMember } from "@/db/queries";
import Icon from "@/app/ui-icon";
import { matchesLibrarySearch, useLibrarySearch } from "@/app/library-search";

function MemberCard({ member }: { member: LibraryMember }) {
  function confirmRemoval(event: FormEvent<HTMLFormElement>) {
    if (
      !window.confirm(
        `Are you sure you want to remove ${member.name} from the library? This cannot be undone.`,
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <article className="member-card">
      <div className="member-avatar" aria-hidden="true">
        {member.name.trim().charAt(0).toUpperCase()}
      </div>
      <div className="member-card-info">
        <h3>{member.name}</h3>
        <p>{member.phone || "No phone number"}</p>
        {member.has_loan_history ? (
          <p className="member-retention-note">
            Kept for loan records
          </p>
        ) : null}
      </div>
      <form
        action={deleteMember.bind(null, member.id)}
        onSubmit={confirmRemoval}
      >
        <button
          aria-label={`Remove ${member.name} from the library`}
          className="delete-button member-delete-button"
          disabled={member.has_loan_history}
          title={
            member.has_loan_history
              ? "Members with loan history are kept to preserve library records."
              : `Remove ${member.name} from the library`
          }
          type="submit"
        >
          <Icon name="trash" />
          <span>Remove</span>
        </button>
      </form>
    </article>
  );
}

export default function MemberDirectory({
  members,
}: {
  members: LibraryMember[];
}) {
  const { query } = useLibrarySearch();
  const matchingMembers = members.filter((member) =>
    matchesLibrarySearch(query, member.name, member.phone ?? ""),
  );

  return (
    <section
      className="catalog member-directory"
      id="member-directory"
      aria-labelledby="members-title"
    >
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">OUR COMMUNITY</p>
          <h2 id="members-title">Library members</h2>
        </div>
        <span className="catalog-note">
          {matchingMembers.length}{" "}
          {matchingMembers.length === 1 ? "member" : "members"}
        </span>
      </div>
      {matchingMembers.length ? (
        <div className="member-list">
          {matchingMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <p className="empty-state">
          {members.length === 0
            ? "No members registered yet."
            : "No members match your search."}
        </p>
      )}
    </section>
  );
}
