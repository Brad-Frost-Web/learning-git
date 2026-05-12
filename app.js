/* ───────────────────────────────────────────────────────────────────
   git cheat sheet · animations
   one GSAP timeline per concept, triggered by IntersectionObserver
   on first scroll-into-view, restartable via replay buttons.
   ─────────────────────────────────────────────────────────────────── */

(() => {
  const { gsap } = window;
  if (!gsap) {
    console.warn("GSAP failed to load. The page will render but won't animate.");
    document.body.classList.add("gsap-ready");
    return;
  }

  /* ───── helpers ───── */

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Prepare a path/line for a "draw in" animation via stroke-dashoffset. */
  function prepDraw(el) {
    if (!el || typeof el.getTotalLength !== "function") return 0;
    const len = el.getTotalLength();
    el.style.strokeDasharray  = `${len} ${len}`;
    el.style.strokeDashoffset = `${len}`;
    return len;
  }

  /** Tween a target along an SVG path using getPointAtLength. */
  function moveAlongPath(target, pathEl, opts = {}) {
    const len = pathEl.getTotalLength();
    const state = { p: opts.from ?? 0 };
    return gsap.to(state, {
      p:        opts.to ?? 1,
      duration: opts.duration ?? 1,
      ease:     opts.ease ?? "power1.inOut",
      onUpdate: () => {
        const pt = pathEl.getPointAtLength(len * state.p);
        gsap.set(target, { x: pt.x, y: pt.y });
      },
    });
  }

  /** Default transform-origin shim so SVG scale animations rotate/scale around their own center. */
  function centerOrigin(els) {
    gsap.set(els, { transformOrigin: "center", transformBox: "fill-box" });
  }

  /* ───── per-concept builders ───── */

  const builders = {};

  /* 01 · Repository --------------------------------------------------- */
  builders.repository = (root) => {
    const files = $$(".repo__file", root);
    const git   = $(".repo__git", root);
    const box   = $(".repo__box", root);

    centerOrigin([git, box]);
    gsap.set(files, { opacity: 0, y: 18 });
    gsap.set(git,   { opacity: 0, scale: 0.5 });

    const tl = gsap.timeline({ paused: true });
    tl.to(files, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.14,
      ease: "power3.out",
    })
      .to(git, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(2.2)",
      }, "-=0.1")
      .fromTo(box,
        { filter: "drop-shadow(0 0 0 rgba(194,90,31,0))" },
        { filter: "drop-shadow(0 0 12px rgba(194,90,31,0.45))", duration: 0.45 },
        "-=0.2")
      .to(box, {
        filter: "drop-shadow(0 0 0 rgba(194,90,31,0))",
        duration: 0.7,
      });
    return tl;
  };

  /* 02 · Clone -------------------------------------------------------- */
  builders.clone = (root) => {
    const cloud   = $(".clone__cloud", root);
    const machine = $(".clone__machine", root);
    const path    = $(".clone__path", root);
    const packets = $$(".clone__packet", root);
    const cap     = $(".clone__caption", root);

    prepDraw(path);
    gsap.set([cloud, machine], { opacity: 0, y: 8 });
    gsap.set(packets, { opacity: 0 });
    gsap.set(cap, { opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to([cloud, machine], {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.12,
      ease: "power2.out",
    })
      .to(path, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: "power1.inOut",
      }, "-=0.15");

    packets.forEach((packet, i) => {
      tl.set(packet, { opacity: 1 }, `+=${i === 0 ? 0 : 0.05}`)
        .add(moveAlongPath(packet, path, { duration: 0.9, ease: "power1.inOut" }))
        .to(packet, { opacity: 0, duration: 0.001 });
    });

    tl.to(cap, { opacity: 1, duration: 0.4 }, "-=0.3");
    return tl;
  };

  /* 03 · Branch ------------------------------------------------------- */
  builders.branch = (root) => {
    const mainLine = $(".branch__main-line", root);
    const featLine = $(".branch__feat-line", root);
    const mainDots = $$(".branch__commit--main", root);
    const featDots = $$(".branch__commit--feat", root);
    const labels   = $$(".branch__label", root);

    prepDraw(mainLine);
    prepDraw(featLine);
    centerOrigin([...mainDots, ...featDots]);
    gsap.set([...mainDots, ...featDots], { scale: 0 });
    gsap.set(labels, { opacity: 0, x: -8 });

    const tl = gsap.timeline({ paused: true });
    tl.to(mainLine, {
      strokeDashoffset: 0,
      duration: 0.7,
      ease: "power1.inOut",
    })
      .to(mainDots, {
        scale: 1,
        duration: 0.4,
        stagger: 0.16,
        ease: "back.out(2.5)",
      }, "-=0.4")
      .to(featLine, {
        strokeDashoffset: 0,
        duration: 0.7,
        ease: "power1.inOut",
      }, "-=0.1")
      .to(featDots, {
        scale: 1,
        duration: 0.4,
        stagger: 0.16,
        ease: "back.out(2.5)",
      }, "-=0.35")
      .to(labels, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.1,
      }, "-=0.2");
    return tl;
  };

  /* 04 · Commit ------------------------------------------------------- */
  builders.commit = (root) => {
    const file      = $(".commit__file", root);
    const lines     = $$(".commit__line", root);
    const plus      = $$(".commit__plus", root);
    const minus     = $(".commit__minus", root);
    const arrow     = $(".commit__arrow", root);
    const arrowhead = $(".commit__arrowhead", root);
    const dot       = $(".commit__dot", root);
    const sha       = $(".commit__sha", root);
    const msg       = $(".commit__msg", root);

    prepDraw(arrow);
    centerOrigin([dot]);
    gsap.set(file, { opacity: 0, y: 10 });
    gsap.set(lines, { opacity: 0, scaleX: 0, transformOrigin: "left center" });
    gsap.set([...plus, minus], { opacity: 0, x: -6 });
    gsap.set(arrowhead, { opacity: 0 });
    gsap.set(dot, { scale: 0 });
    gsap.set([sha, msg], { opacity: 0, x: 10 });

    const tl = gsap.timeline({ paused: true });
    tl.to(file, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
      .to(lines, {
        opacity: 1,
        scaleX: 1,
        duration: 0.35,
        stagger: 0.07,
        ease: "power2.out",
      })
      .to([minus, ...plus], {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.08,
      }, "-=0.15")
      .to(arrow, {
        strokeDashoffset: 0,
        duration: 0.5,
        ease: "power1.inOut",
      }, "+=0.1")
      .to(arrowhead, { opacity: 1, duration: 0.15 }, "-=0.05")
      .to(dot, {
        scale: 1,
        duration: 0.45,
        ease: "back.out(2.4)",
      }, "-=0.1")
      .to([sha, msg], {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.08,
      }, "-=0.2");
    return tl;
  };

  /* 05 · Push / Pull -------------------------------------------------- */
  builders.pushpull = (root) => {
    const local    = $(".pp__local", root);
    const remote   = $(".pp__remote", root);
    const arcPush  = $(".pp__arc--push", root);
    const arcPull  = $(".pp__arc--pull", root);
    const labelPu  = $(".pp__label--push", root);
    const labelPl  = $(".pp__label--pull", root);
    const traveler = $(".pp__traveler", root);

    prepDraw(arcPush);
    prepDraw(arcPull);
    centerOrigin([traveler]);
    gsap.set([local, remote], { opacity: 0, y: 8 });
    gsap.set([labelPu, labelPl], { opacity: 0 });
    gsap.set(traveler, { opacity: 0, scale: 0 });

    let mode = "push";

    function build() {
      const tl = gsap.timeline({ paused: true });
      const arc   = mode === "push" ? arcPush : arcPull;
      const label = mode === "push" ? labelPu : labelPl;
      const otherArc   = mode === "push" ? arcPull : arcPush;
      const otherLabel = mode === "push" ? labelPl : labelPu;

      prepDraw(arc);
      gsap.set([otherArc], { opacity: 0.25 });
      gsap.set(arc, { opacity: 1 });
      gsap.set(otherLabel, { opacity: 0 });
      gsap.set(traveler, { opacity: 0, scale: 0 });

      tl.to([local, remote], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
        .to(arc, {
          strokeDashoffset: 0,
          duration: 0.7,
          ease: "power1.inOut",
        }, "-=0.2")
        .to(label, { opacity: 1, duration: 0.3 }, "-=0.3")
        .to(traveler, {
          opacity: 1,
          scale: 1,
          duration: 0.25,
          ease: "back.out(2)",
        })
        .add(moveAlongPath(traveler, arc, { duration: 1.1, ease: "power2.inOut" }))
        .to(traveler, { scale: 0.7, opacity: 0, duration: 0.25 });
      return tl;
    }

    let tl = build();
    const wrapper = {
      play:    (from) => tl.play(from ?? 0),
      restart: ()     => tl.restart(),
      setMode: (m) => {
        mode = m;
        tl.kill();
        tl = build();
        tl.restart();
      },
    };

    // wire toggle buttons (scoped to this concept's controls)
    const toggle = root.parentElement.querySelectorAll(".toggle__btn");
    toggle.forEach((btn) => {
      btn.addEventListener("click", () => {
        toggle.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        wrapper.setMode(btn.dataset.mode);
      });
    });
    return wrapper;
  };

  /* 06 · Diff --------------------------------------------------------- */
  builders.diff = (root) => {
    const cols   = $$(".diff__col", root);
    const lines  = $$(".diff__line", root);
    const plus   = $$(".diff__plus", root);
    const minus  = $(".diff__minus", root);

    gsap.set(cols, { opacity: 0, y: 8 });
    gsap.set(lines, { opacity: 0, x: -6 });
    gsap.set([...plus, minus], { opacity: 0, x: -8 });

    const tl = gsap.timeline({ paused: true });
    tl.to(cols, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.12,
      ease: "power2.out",
    })
      .to(lines, {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      }, "-=0.2")
      .to([minus, ...plus], {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.1,
      }, "-=0.1");
    return tl;
  };

  /* 07 · Merge -------------------------------------------------------- */
  builders.merge = (root) => {
    const mainLine = $(".merge__main", root);
    const featLine = $(".merge__feat", root);
    const mainDots = $$(".merge__c--main", root);
    const featDots = $$(".merge__c--feat", root);
    const diamond  = $(".merge__diamond", root);
    const dLabel   = $(".merge__diamond-label", root);
    const labels   = $$(".merge__label", root);

    prepDraw(mainLine);
    prepDraw(featLine);
    centerOrigin([...mainDots, ...featDots, diamond]);
    gsap.set([...mainDots, ...featDots], { scale: 0 });
    gsap.set(diamond, { scale: 0, opacity: 0 });
    gsap.set([dLabel, ...labels], { opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(mainLine, { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut" })
      .to(mainDots, {
        scale: 1,
        duration: 0.35,
        stagger: 0.14,
        ease: "back.out(2.4)",
      }, "-=0.4")
      .to(featLine, {
        strokeDashoffset: 0,
        duration: 1.1,
        ease: "power1.inOut",
      }, "-=0.1")
      .to(featDots, {
        scale: 1,
        duration: 0.35,
        stagger: 0.18,
        ease: "back.out(2.4)",
      }, "-=0.8")
      .to(diamond, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(2.4)",
      }, "-=0.15")
      .to([dLabel, ...labels], {
        opacity: 1,
        duration: 0.35,
        stagger: 0.06,
      }, "-=0.2");
    return tl;
  };

  /* 08 · Rebase ------------------------------------------------------- */
  builders.rebase = (root) => {
    const mainLine = $(".rebase__main", root);
    const featOld  = $(".rebase__feat-old", root);
    const mainDots = $$(".rebase__c--main", root);
    const featDots = $$(".rebase__c--feat", root);
    const ghost    = $(".rebase__ghost", root);
    const labels   = $$(".rebase__label", root);
    const newTip   = mainDots.find((d) => d.dataset.i === "new-tip");
    const stableMainDots = mainDots.filter((d) => d.dataset.i !== "new-tip");

    prepDraw(mainLine);
    prepDraw(featOld);
    centerOrigin([...mainDots, ...featDots]);

    gsap.set([...stableMainDots, newTip, ...featDots], { scale: 0 });
    gsap.set(newTip, { scale: 0 });
    gsap.set([ghost, ...labels], { opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(mainLine, { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut" })
      .to(stableMainDots, {
        scale: 1,
        duration: 0.35,
        stagger: 0.12,
        ease: "back.out(2.4)",
      }, "-=0.35")
      .to(featOld, {
        strokeDashoffset: 0,
        duration: 0.7,
        ease: "power1.inOut",
      }, "-=0.1")
      .to(featDots, {
        scale: 1,
        duration: 0.35,
        stagger: 0.14,
        ease: "back.out(2.4)",
      }, "-=0.45")
      .to(labels, { opacity: 1, duration: 0.3, stagger: 0.1 }, "-=0.2")
      .addLabel("rebasing", "+=0.5")
      // lift the floaters up off the feat branch
      .to(featDots, {
        y: -20,
        duration: 0.45,
        ease: "power2.inOut",
      }, "rebasing")
      // slide them rightwards to sit above the main-tip
      .to(featDots, {
        x: 40,
        duration: 0.6,
        ease: "power2.inOut",
      })
      // drop them down onto the main line
      .to(featDots, {
        y: 80,
        duration: 0.5,
        ease: "power2.in",
      })
      // and fade the old feat path to show that history is gone
      .to(featOld, { opacity: 0.18, duration: 0.5 }, "-=0.5")
      // reveal the "→ replayed on top" caption + the new tip dot if present
      .to(ghost, { opacity: 1, duration: 0.4 }, "-=0.2");

    if (newTip) {
      tl.to(newTip, {
        scale: 1,
        duration: 0.35,
        ease: "back.out(2.4)",
      }, "-=0.4");
    }
    return tl;
  };

  /* 09 · Merge conflict ---------------------------------------------- */
  builders.conflict = (root) => {
    const file     = $(".conflict__file", root);
    const lines    = $$(".conflict__line", root);
    const head     = $(".conflict__head", root);
    const divider  = $(".conflict__divider", root);
    const theirs   = $(".conflict__theirs", root);
    const resolved = $(".conflict__resolved", root);

    gsap.set(file, { opacity: 0, y: 10 });
    gsap.set(lines, { opacity: 0 });
    gsap.set([head, divider, theirs, resolved], { opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(file, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" })
      .to(lines, { opacity: 1, duration: 0.3, stagger: 0.08 }, "-=0.1")
      .to(head, { opacity: 1, duration: 0.35 }, "+=0.15")
      .to(divider, { opacity: 1, duration: 0.25 })
      .to(theirs, { opacity: 1, duration: 0.35 })
      .addLabel("pause", "+=0.9")
      .to([head, divider, theirs], {
        opacity: 0,
        duration: 0.5,
        stagger: 0.04,
      }, "pause")
      .to(resolved, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.2");
    return tl;
  };

  /* 10 · Pull Request ------------------------------------------------- */
  builders.pr = (root) => {
    const card     = $(".pr__card", root);
    const bar      = $(".pr__bar", root);
    const id       = $(".pr__id", root);
    const title    = $(".pr__title", root);
    const meta     = $(".pr__meta", root);
    const avatars  = $$(".pr__reviewers circle", root);
    const avLabel  = $(".pr__avatar-label", root);
    const comment  = $(".pr__comment", root);
    const checkG   = $(".pr__check", root);
    const tick     = $(".pr__check-tick", root);
    const checkLab = $(".pr__check-label", root);
    const merge    = $(".pr__merge", root);

    prepDraw(tick);
    centerOrigin([checkG, merge]);
    gsap.set([card, bar], { opacity: 0, y: 14 });
    gsap.set([id, title, meta, avLabel], { opacity: 0 });
    gsap.set(avatars, { opacity: 0, scale: 0, transformOrigin: "center", transformBox: "fill-box" });
    gsap.set(comment, { opacity: 0, x: -10 });
    gsap.set(checkG, { opacity: 0, scale: 0 });
    gsap.set(checkLab, { opacity: 0, x: -8 });
    gsap.set(merge, { opacity: 0, scale: 0.9 });

    const tl = gsap.timeline({ paused: true });
    tl.to([card, bar], { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" })
      .to([id, title], { opacity: 1, duration: 0.35, stagger: 0.08 }, "-=0.2")
      .to(meta, { opacity: 1, duration: 0.35 }, "-=0.15")
      .to(avatars, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.12,
        ease: "back.out(2.4)",
      }, "+=0.05")
      .to(avLabel, { opacity: 1, duration: 0.3 }, "-=0.2")
      .to(comment, { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" }, "+=0.05")
      .to(checkG, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(2.4)",
      }, "+=0.1")
      .to(tick, { strokeDashoffset: 0, duration: 0.35, ease: "power1.inOut" }, "-=0.15")
      .to(checkLab, { opacity: 1, x: 0, duration: 0.35 }, "-=0.1")
      .to(merge, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)" }, "-=0.1")
      .to(merge, {
        scale: 1.06,
        duration: 0.35,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
      });
    return tl;
  };

  /* 11 · Issue -------------------------------------------------------- */
  builders.issue = (root) => {
    const card    = $(".issue__card", root);
    const open    = $(".issue__status--open", root);
    const prog    = $(".issue__status--prog", root);
    const closed  = $(".issue__status--closed", root);
    const tick    = $(".issue__tick", root);
    const label   = $(".issue__label", root);
    const id      = $(".issue__id", root);
    const title   = $(".issue__title", root);
    const rule    = $(".issue__rule", root);
    const body    = $$(".issue__body", root);

    prepDraw(tick);
    centerOrigin([open, prog, closed, label]);
    gsap.set(card, { opacity: 0, y: 14 });
    gsap.set(open, { opacity: 0, scale: 0.85 });
    gsap.set([prog, closed], { opacity: 0, scale: 0.85 });
    gsap.set(label, { opacity: 0, scale: 0.85 });
    gsap.set([id, title], { opacity: 0, y: 6 });
    gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(body, { opacity: 0, x: -6 });

    const tl = gsap.timeline({ paused: true });
    tl.to(card, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
      .to(open, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" }, "-=0.2")
      .to(label, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" }, "-=0.3")
      .to([id, title], { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 }, "-=0.2")
      .to(rule, { scaleX: 1, duration: 0.4, ease: "power2.inOut" }, "-=0.2")
      .to(body, { opacity: 1, x: 0, duration: 0.35, stagger: 0.07 }, "-=0.3")
      .addLabel("toProg", "+=0.7")
      .to(open, { opacity: 0, scale: 0.85, duration: 0.3 }, "toProg")
      .to(prog, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" }, "toProg+=0.1")
      .addLabel("toClosed", "+=1")
      .to(prog, { opacity: 0, scale: 0.85, duration: 0.3 }, "toClosed")
      .to(closed, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" }, "toClosed+=0.1")
      .to(tick, { strokeDashoffset: 0, duration: 0.4, ease: "power1.inOut" }, "-=0.15");
    return tl;
  };

  /* ───── hero ambient loop ───── */

  function buildHero() {
    const rail    = $(".hero__rail");
    const commits = $$(".hero__commit");
    const brLine  = $(".hero__branch-line");
    const brDots  = $$(".hero__branch-commit");
    if (!rail) return;

    prepDraw(brLine);
    centerOrigin([...commits, ...brDots]);
    gsap.set([...commits, ...brDots], { scale: 0 });

    const tl = gsap.timeline();
    tl.to(commits, {
      scale: 1,
      duration: 0.45,
      stagger: 0.13,
      ease: "back.out(2)",
    })
      .to(brLine, {
        strokeDashoffset: 0,
        duration: 1.1,
        ease: "power1.inOut",
      }, "-=0.2")
      .to(brDots, {
        scale: 1,
        duration: 0.4,
        stagger: 0.22,
        ease: "back.out(2)",
      }, "-=0.6")
      // ambient pulse forever
      .to([...commits, ...brDots], {
        scale: 1.1,
        duration: 0.7,
        stagger: { each: 0.08, repeat: -1, yoyo: true },
        ease: "sine.inOut",
      }, "+=0.5");
    return tl;
  }

  /* ───── setup ───── */

  const sections  = $$("[data-concept]");
  const timelines = {};

  sections.forEach((section) => {
    const key = section.dataset.concept;
    const builder = builders[key];
    if (!builder) return;
    try {
      timelines[key] = builder(section);
    } catch (err) {
      console.warn(`Failed to build animation for ${key}`, err);
    }
  });

  // mark ready so CSS can fade in diagrams cleanly
  document.body.classList.add("gsap-ready");

  // hero
  buildHero();

  if (reducedMotion) {
    // play each timeline to its final state once, no looping
    Object.values(timelines).forEach((tl) => {
      if (tl && tl.progress) tl.progress(1).pause();
      else if (tl && tl.restart) tl.restart();
    });
    return;
  }

  // play each concept's timeline the first time it scrolls into view
  const seen = new WeakSet();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (seen.has(entry.target)) return;
        seen.add(entry.target);

        const key = entry.target.dataset.concept;
        const tl  = timelines[key];
        if (!tl) return;
        if (typeof tl.restart === "function") tl.restart();
        else if (typeof tl.play === "function") tl.play(0);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
  );

  sections.forEach((s) => io.observe(s));

  // replay buttons
  $$(".replay").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tl = timelines[btn.dataset.target];
      if (!tl) return;
      if (typeof tl.restart === "function") tl.restart();
      else if (typeof tl.play === "function") tl.play(0);
    });
  });
})();
