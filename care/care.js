(function () {
  var SVGNS = "http://www.w3.org/2000/svg";
  var COL = { yellow: "#F5DD65", green: "#A2D5B0", amber: "#FBC64B", pink: "#E66581", blue: "#8FC5D6", purple: "#C85EB5", olive: "#9EAF5C", orange: "#F68657" };

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) { for (var k in attrs) { if (k === "style") { n.style.cssText = attrs[k]; } else { n.setAttribute(k, attrs[k]); } } }
    if (text !== undefined) { n.textContent = text; }
    return n;
  }

  /* ---------- tabs ---------- */
  var TABS = ["overview", "toolkit", "pilot", "research"];
  function show(tab, scrollId) {
    if (TABS.indexOf(tab) === -1) { tab = "overview"; }
    TABS.forEach(function (t) { document.getElementById("tab-" + t).hidden = t !== tab; });
    document.querySelectorAll("nav.tabs button[data-go]").forEach(function (b) {
      if (b.getAttribute("data-go") === tab) { b.setAttribute("aria-current", "page"); } else { b.removeAttribute("aria-current"); }
    });
    if (scrollId) {
      var target = document.getElementById(scrollId);
      if (target) { target.scrollIntoView(); }
    } else {
      window.scrollTo(0, 0);
    }
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-go]");
    if (!t) { return; }
    e.preventDefault();
    var tab = t.getAttribute("data-go");
    if (location.hash !== "#" + tab) { history.pushState(null, "", "#" + tab); }
    show(tab, t.getAttribute("data-scroll"));
  });
  window.addEventListener("popstate", function () { show(location.hash.slice(1)); });

  var CUR = [
    { id: "valued", name: "feeling valued", col: COL.pink, card: "Someone Needed Me", story: "In Elena’s story: for most of her life she looked after everyone. Now others look after her.", q: "Who still comes to you for advice or help? What do they ask you about?", hot: true },
    { id: "agency", name: "agency", col: COL.amber, card: "One Courageous No", story: "In Elena’s story: small decisions at home, like how her room is arranged, are now made for her.", q: "Which things at home would you like to keep deciding yourself?", hot: true },
    { id: "social", name: "social presence", col: COL.yellow, card: "Daily Meeting Place", story: "In Elena’s story: most people who visit now come to help, and fewer come just to talk.", q: "Who used to drop by just to talk? Would you like to see them more?", hot: false },
    { id: "efficacy", name: "self-efficacy", col: COL.green, card: "I Am Good At", story: "In Elena’s story: she knows exactly how her home should run.", q: "What do you still do better than anyone else in the house?", hot: false },
    { id: "activities", name: "activities", col: COL.green, card: "One Busy Day", story: "In Elena’s story: her days used to be full of cooking and errands.", q: "What did a good day look like before? Which part of it would you like to keep?", hot: false },
    { id: "aging", name: "changes in the body", col: COL.blue, card: "Changed with Age", story: "In Elena’s story: she tires faster and needs help with things she used to do alone.", q: "What has changed about what you can do, and what has stayed the same?", hot: true },
    { id: "ageassoc", name: "how others see me", col: COL.purple, card: "At This Age", story: "In Elena’s story: she worries her family now sees her as someone to look after.", q: "How do you think your family sees you now? Is that how you see yourself?", hot: false },
    { id: "satisfaction", name: "life satisfaction", col: COL.olive, card: "Life Ahead", story: "In Elena’s story: she wants the coming months to still feel like her own life.", q: "What would make the next few months feel like yours?", hot: false },
    { id: "emotions", name: "emotions", col: COL.orange, card: "I Was Surprised", story: "In Elena’s story: irritation about small things, and guilt about snapping at her daughter.", q: "What has surprised you about how strongly you feel about small things at home?", hot: true }
  ];

  function wave(y0, a, phase, len) {
    var d = "M -60 " + y0, x = -60, first = true;
    while (x < 1260) {
      if (first) { d += " Q " + (x + len / 4 + phase) + " " + (y0 - a) + " " + (x + len / 2) + " " + y0; first = false; }
      else { d += " T " + (x + len / 2) + " " + y0; }
      x += len / 2;
    }
    return d;
  }
  function path(d, style) {
    var p = document.createElementNS(SVGNS, "path");
    p.setAttribute("d", d);
    p.setAttribute("style", style);
    return p;
  }

  var band = document.getElementById("band");
  CUR.forEach(function (c, i) {
    band.appendChild(path(wave(3 + i * 2, 1.5, (i % 4) * 10, 260 + (i % 3) * 40), "fill: none; stroke: " + c.col + "; stroke-width: 1.2;"));
  });

  var river = document.getElementById("river");
  river.appendChild(path("M0 8 H1200", "fill: none; stroke: #1E2B33; stroke-width: 1.5;"));
  var g = document.createElementNS(SVGNS, "g");
  g.setAttribute("class", "drift");
  river.appendChild(g);
  var strands = CUR.map(function (c, i) {
    var p = path(wave(46 + i * 28, 7 + (i % 3) * 5, (i % 4) * 12, 220 + (i % 3) * 60), "");
    g.appendChild(p);
    return p;
  });

  var chipBox = document.getElementById("chips");
  var chips = CUR.map(function (c) {
    var b = el("button", { type: "button", "class": "chip", "aria-pressed": "false" });
    b.appendChild(el("span", { "class": "sw", style: "background: " + c.col }));
    b.appendChild(document.createTextNode(c.name));
    b.addEventListener("click", function () { select(c.id); });
    chipBox.appendChild(b);
    return b;
  });

  function select(id) {
    CUR.forEach(function (c, i) {
      var on = c.id === id;
      var w = on ? 5 : (c.hot ? 2.4 : 1.4);
      var o = on ? 1 : (c.hot ? 0.85 : 0.45);
      strands[i].setAttribute("style", "fill: none; stroke: " + c.col + "; stroke-width: " + w + "; opacity: " + o + "; stroke-linecap: round;");
      chips[i].setAttribute("aria-pressed", on ? "true" : "false");
      if (on) {
        document.getElementById("sel-band").style.background = c.col;
        document.getElementById("sel-name").textContent = c.name;
        document.getElementById("sel-card").textContent = "card · " + c.card;
        document.getElementById("sel-story").textContent = c.story;
        document.getElementById("sel-q").textContent = "“" + c.q + "”";
      }
    });
  }
  select("valued");

  function box(top, title, text, col) {
    var b = el("div", { "class": "box", style: "padding: 0; overflow: hidden; display: flex; flex-direction: column" });
    b.appendChild(el("div", { style: "height: 12px; background: " + col }));
    var inner = el("div", { style: "padding: 24px; display: flex; flex-direction: column; gap: 6px" });
    inner.appendChild(el("div", { style: "font-size: 12px; letter-spacing: 0.12em; color: #6B6259; text-transform: uppercase" }, top));
    inner.appendChild(el("div", { "class": "serif", style: "font-size: 25px; line-height: 1.2" }, title));
    inner.appendChild(el("div", { style: "font-size: 15px; color: #4A433C; line-height: 1.55; margin-top: 4px" }, text));
    b.appendChild(inner);
    return b;
  }

  var parts = document.getElementById("parts");
  [["At home, over a week", "Reflection booklet", "Short daily activities the person completes at their own pace, in writing or with tick boxes.", COL.yellow],
   ["With family or a clinician", "Conversation cards", "Each card starts a conversation about one part of life, from a small everyday moment.", COL.pink],
   ["To keep or to share", "A personal map", "One page in the person’s own words: what the change is touching and what matters most now.", COL.blue]].forEach(function (p) {
    parts.appendChild(box(p[0], p[1], p[2], p[3]));
  });

  var ce = document.getElementById("card-examples");
  [["Someone Needed Me", "../images/someone-needed-me.png", "feeling valued", "Who still comes to you for advice or help? What do they ask you about?"],
   ["One Courageous No", "../images/one-courageous-no.png", "agency", "Which things at home would you like to keep deciding yourself?"],
   ["Changed with Age", "../images/changed-with-age.png", "changes in the body", "What has changed about what you can do, and what has stayed the same?"]].forEach(function (e) {
    var b = el("div", { "class": "box", style: "padding: 22px; display: flex; flex-direction: column; gap: 12px" });
    b.appendChild(el("img", { src: e[1], alt: e[0] + " card", style: "display: block; width: 210px; max-width: 100%; height: auto; margin: -16px auto -10px" }));
    b.appendChild(el("div", { "class": "small" }, e[2] + " · for Elena"));
    b.appendChild(el("div", { "class": "serif", style: "font-size: 20px; line-height: 1.4" }, "“" + e[3] + "”"));
    ce.appendChild(b);
  });

  var tags = document.getElementById("map-tags");
  [["feeling valued", COL.pink], ["agency", COL.amber], ["changes in the body", COL.blue], ["emotions", COL.orange]].forEach(function (t) {
    tags.appendChild(el("span", { "class": "tagpill", style: "background: " + t[1] }, t[0]));
  });

  var commitments = document.getElementById("commitments");
  ["Plain, gentle language. No diagnoses or medical labels in the materials.",
   "Every page can be skipped. People take part only as far as they want to.",
   "Tick-box options for days when energy is low or writing is hard.",
   "The person decides what is shared, and with whom.",
   "It is not a clinical assessment and does not replace care.",
   "Materials are developed and tested with clinicians, patients and families before use."].forEach(function (m) {
    commitments.appendChild(el("div", { style: "border-top: 1px solid #D9CEBF; padding-top: 12px" }, m));
  });

  var phases = document.getElementById("phases");
  [["Months 1–2", "Co-design", "Adapt the booklet, cards and map with clinicians, social workers, chaplains and family caregivers."],
   ["Months 3–4", "Pilot at home", "A small number of patients and families use the toolkit at home between visits, with the option of facilitator-led synthesis."],
   ["Months 5–6", "Learn and refine", "Interviews with participants and the care team. A revised toolkit and a short report."]].forEach(function (p) {
    var d = el("div", { "class": "phase" });
    d.appendChild(el("div", { "class": "when" }, p[0]));
    d.appendChild(el("div", { "class": "serif", style: "font-size: 25px; margin: 4px 0 6px" }, p[1]));
    d.appendChild(el("div", { style: "font-size: 15px; color: #4A433C; line-height: 1.55" }, p[2]));
    phases.appendChild(d);
  });

  var aspects = document.getElementById("aspects");
  [["feeling valued", "Feeling needed and appreciated", COL.pink],
   ["agency", "Making decisions and having control", COL.amber],
   ["social presence", "Belonging and connection with people", COL.yellow],
   ["self-efficacy", "Confidence in what one can do", COL.green],
   ["activities", "Daily rhythms and routines", COL.green],
   ["changes in the body", "What the body and mind can do now", COL.blue],
   ["how others see me", "What others expect, and what I expect of myself", COL.purple],
   ["life satisfaction", "How one feels about life and its direction", COL.olive],
   ["emotions", "Feelings that shape experience", COL.orange]].forEach(function (a) {
    var r = el("div", { "class": "aspect-row" });
    r.appendChild(el("div", { "class": "sq", style: "background: " + a[2] }));
    r.appendChild(el("div", { "class": "n" }, a[0]));
    r.appendChild(el("div", { "class": "l" }, a[1]));
    aspects.appendChild(r);
  });

  var syn = document.getElementById("synthesis-steps");
  [["1", "Reflect", "The person completes the booklet, cards and map at their own pace."],
   ["2", "Draft", "A trained facilitator drafts a short synthesis of the themes."],
   ["3", "Review", "The person reviews, revises and approves the summary."],
   ["4", "Choose", "The person decides whether to share it, and with whom."]].forEach(function (r) {
    var row = el("div", { style: "display: flex; gap: 16px; align-items: flex-start" });
    row.appendChild(el("div", { "class": "dot", style: "border-radius: 17px; background: #F6F5F2; border: 1px solid #D9CEBF" }, r[0]));
    var t = el("div");
    t.appendChild(el("div", { style: "font-weight: 600" }, r[1]));
    t.appendChild(el("div", { style: "font-size: 15px; color: #6B6259" }, r[2]));
    row.appendChild(t);
    syn.appendChild(row);
  });

  var pq = document.getElementById("pilot-questions");
  ["Do patients and families find the reflection materials useful?",
   "Does the optional synthesis process help participants put their priorities into words?",
   "Do clinicians find the resulting map useful and practical within existing care workflows?",
   "How does the toolkit complement existing serious-illness communication resources?"].forEach(function (q) {
    pq.appendChild(el("div", { "class": "body" }, q));
  });

  show(location.hash.slice(1) || "overview");
})();
