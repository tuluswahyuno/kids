"use client";

import { useState } from "react";
import { activeProfile, addProfile, AVATARS, selectProfile, useProfiles } from "@/engine/profiles";
import { streakDays, totalStars, useProgress } from "@/engine/progress";

/** Profil anak (nama panggilan + avatar saja) dan ringkasan bintang. */
export function ProfileBar() {
  const profiles = useProfiles();
  const progress = useProgress();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const me = activeProfile(profiles);

  const form = (
    <form
      className="profileform"
      onSubmit={(e) => {
        e.preventDefault();
        addProfile(name, avatar);
        setName("");
        setOpen(false);
      }}
    >
      <label className="group-title" htmlFor="pname">
        Siapa namamu?
      </label>
      <input
        id="pname"
        className="gateinput"
        style={{ fontSize: "1.2em" }}
        value={name}
        maxLength={20}
        placeholder="Nama panggilan"
        onChange={(e) => setName(e.target.value)}
        autoComplete="off"
      />
      <div className="avatars" role="radiogroup" aria-label="Pilih avatar">
        {AVATARS.map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={a === avatar}
            className={`avatar${a === avatar ? " sel" : ""}`}
            onClick={() => setAvatar(a)}
          >
            {a}
          </button>
        ))}
      </div>
      <button className="btn primary xl" type="submit" disabled={!name.trim()}>
        Mulai bermain
      </button>
    </form>
  );

  if (!me) {
    return <div className="panel">{form}</div>;
  }

  return (
    <>
      <div className="profilebar">
        <button type="button" className="btn profilebtn" onClick={() => setOpen(true)} aria-label={`Profil ${me.name}. Ganti profil`}>
          <span className="avatar-lg">{me.avatar}</span>
          <span>
            <b>Halo, {me.name}!</b>
            <small>
              ⭐ {totalStars(progress, me.id)} bintang · 🔥 {streakDays(progress, me.id)} hari
            </small>
          </span>
        </button>
      </div>

      {open && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Ganti profil" onClick={() => setOpen(false)}>
          <div className="panel dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Siapa yang main?</h2>
            <div className="profilelist">
              {profiles.list.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`btn${p.id === me.id ? " primary" : ""}`}
                  onClick={() => {
                    selectProfile(p.id);
                    setOpen(false);
                  }}
                >
                  <span className="avatar-lg">{p.avatar}</span> {p.name}
                </button>
              ))}
            </div>
            <hr style={{ width: "100%", border: 0, borderTop: "2px dashed #e5d9c3" }} />
            {form}
            <button type="button" className="btn" onClick={() => setOpen(false)}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
