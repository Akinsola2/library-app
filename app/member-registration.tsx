"use client";

import { addMember } from "@/app/actions";

export default function MemberRegistration() {
  return (
    <section
      className="management-panel member-registration"
      id="members"
      aria-labelledby="register-member-title"
    >
      <div className="management-heading">
        <p className="eyebrow">GROW OUR COMMUNITY</p>
        <h2 id="register-member-title">Register a new member</h2>
        <p>Add a reader to the library. A phone number is optional.</p>
      </div>
      <form action={addMember} className="member-form">
        <label>
          <span>Member name</span>
          <input
            autoComplete="name"
            maxLength={200}
            name="name"
            placeholder="e.g. Amara Okafor"
            required
          />
        </label>
        <label>
          <span>
            Phone number <span className="optional-label">(optional)</span>
          </span>
          <input
            autoComplete="tel"
            maxLength={40}
            name="phone"
            placeholder="e.g. 080 1234 5678"
            type="tel"
          />
        </label>
        <button className="primary-button" type="submit">
          Register member
        </button>
      </form>
    </section>
  );
}
