(function () {
  var SVGNS = "http://www.w3.org/2000/svg";
  var COL = { yellow: "#F5DD65", green: "#A2D5B0", amber: "#FBC64B", pink: "#E66581", blue: "#8FC5D6", purple: "#C85EB5", olive: "#9EAF5C", orange: "#F68657" };

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) { for (var k in attrs) { if (k === "style") { n.style.cssText = attrs[k]; } else { n.setAttribute(k, attrs[k]); } } }
    if (html !== undefined) { n.textContent = html; }
    return n;
  }

  /* ---------- tabs ---------- */
  var TABS = ["overview", "program", "model", "research"];
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
    var scrollId = t.getAttribute("data-scroll");
    if (location.hash !== "#" + tab) { history.pushState(null, "", "#" + tab); }
    show(tab, scrollId);
  });
  window.addEventListener("popstate", function () { show(location.hash.slice(1)); });

  /* ---------- currents ---------- */
  var CUR = [
    { id: "agency", name: "agency", col: COL.amber, card: "One Courageous No", robert: "In Robert’s story: a decision about his house was made without him.", question: "When your son decided to hire the service, were you part of that decision?", hot: true },
    { id: "valued", name: "feeling valued", col: COL.pink, card: "Someone Needed Me", robert: "In Robert’s story: he is no longer the one who fixes things.", question: "Before the surgery, who looked after the lawn? What did it mean to you to be the one doing it?", hot: true },
    { id: "social", name: "social presence", col: COL.yellow, card: "Daily Meeting Place", robert: "In Robert’s story: the yard and the hardware store were where he saw people.", question: "Did working on the yard put you in touch with people, like neighbours or the hardware store?", hot: false },
    { id: "efficacy", name: "self-efficacy", col: COL.green, card: "I Am Good At", robert: "In Robert’s story: he trusted his hands for forty years.", question: "What part of looking after the house were you best at?", hot: false },
    { id: "activities", name: "activities", col: COL.green, card: "One Busy Day", robert: "In Robert’s story: his Saturdays used to be full of projects.", question: "Now that someone else does the yard, what fills your Saturdays?", hot: false },
    { id: "aging", name: "aging process", col: COL.blue, card: "Changed with Age", robert: "In Robert’s story: his knee cannot do what it used to.", question: "What has the surgery changed about what you can do, and what you expect of yourself?", hot: true },
    { id: "ageassoc", name: "age associations", col: COL.purple, card: "At This Age", robert: "In Robert’s story: his son may see him as someone to protect now.", question: "What do people expect of a man your age after surgery? Do you agree with them?", hot: false },
    { id: "satisfaction", name: "life satisfaction", col: COL.olive, card: "Life Ahead", robert: "In Robert’s story: the garden has been part of how he sees his life.", question: "Looking ahead to next spring, what would make the garden feel like yours again?", hot: false },
    { id: "emotions", name: "emotions", col: COL.orange, card: "I Was Surprised", robert: "In Robert’s story: irritation, and embarrassment that it bothers him so much.", question: "What has surprised you about how strongly you feel about the lawn?", hot: true }
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
  var strandEls = CUR.map(function (c, i) {
    var p = path(wave(46 + i * 28, 7 + (i % 3) * 5, (i % 4) * 12, 220 + (i % 3) * 60), "");
    g.appendChild(p);
    return p;
  });

  var chipBox = document.getElementById("chips");
  var chipEls = CUR.map(function (c) {
    var b = el("button", { type: "button", "class": "chip", "aria-pressed": "false" });
    var sw = el("span", { "class": "sw", style: "background: " + c.col });
    b.appendChild(sw);
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
      strandEls[i].setAttribute("style", "fill: none; stroke: " + c.col + "; stroke-width: " + w + "; opacity: " + o + "; stroke-linecap: round;");
      chipEls[i].setAttribute("aria-pressed", on ? "true" : "false");
      if (on) {
        document.getElementById("sel-band").style.background = c.col;
        document.getElementById("sel-name").textContent = c.name;
        document.getElementById("sel-card").textContent = "card · " + c.card;
        document.getElementById("sel-robert").textContent = c.robert;
        document.getElementById("sel-q").textContent = "“" + c.question + "”";
      }
    });
  }
  select("agency");

  /* ---------- overview previews ---------- */
  var wp = document.getElementById("week-preview");
  [["1", "Starts from the person’s own words", "whatever they bring to the first session", COL.yellow],
   ["2", "Follows what comes up", "each question opens a different part of life", COL.amber],
   ["3", "Keeps track of all nine", "and returns to the parts not yet explored", COL.blue],
   ["4", "Ends each week with a step", "chosen by the person, or a decision to pause", COL.orange]].forEach(function (w) {
    var row = el("div", { style: "display: flex; gap: 14px; align-items: flex-start" });
    row.appendChild(el("div", { "class": "dot", style: "background: " + w[3] }, w[0]));
    var t = el("div");
    t.appendChild(el("div", { style: "font-weight: 600" }, w[1]));
    t.appendChild(el("div", { style: "font-size: 15px; color: #6B6259" }, w[2]));
    row.appendChild(t);
    wp.appendChild(row);
  });

  var flow = document.getElementById("flow");
  [["Interviewer", "Asks card-based questions across four weekly sessions.", false],
   ["Analyzer", "Finds tentative patterns across everything the person said.", false],
   ["The person reviews", "Confirms, edits or rejects each pattern.", true],
   ["Recommender", "Offers options, tradeoffs and checked resources.", false]].forEach(function (f, i, arr) {
    var b = el("div", { "class": "box" + (f[2] ? " hl" : "") });
    b.appendChild(el("div", { style: "font-weight: 600; font-size: 17px" }, f[0]));
    b.appendChild(el("div", { style: "font-size: 15px; color: #4A433C; margin-top: 4px" }, f[1]));
    flow.appendChild(b);
    if (i < arr.length - 1) { flow.appendChild(el("div", { "class": "arrow", "aria-hidden": "true" }, "→")); }
  });

  /* ---------- program ---------- */
  var weeks = document.getElementById("weeks");
  [["Session 1", "What the yard meant to him", "came up: feeling valued · social presence · activities", "Someone Needed Me", "Before the surgery, who looked after the lawn? What did it mean to you to be the one doing it?", COL.yellow],
   ["Session 2", "The decision his son made", "came up: agency · age associations", "One Courageous No", "When your son decided to hire the service, were you part of that decision?", COL.amber],
   ["Session 3", "His knee, and what he can still do", "came up: aging process · self-efficacy", "Changed with Age", "What has the surgery changed about what you can do, and what you expect of yourself?", COL.blue],
   ["Session 4", "How he feels, and what comes next", "came up: emotions · life satisfaction", "It Gave Me Hope", "Since the surgery, has anything given you hope, even something small?", COL.orange]].forEach(function (w) {
    var b = el("div", { "class": "box week" });
    b.appendChild(el("div", { "class": "bar", style: "background: " + w[5] }));
    b.appendChild(el("div", { style: "font-size: 12px; letter-spacing: 0.14em; color: #6B6259; text-transform: uppercase" }, w[0]));
    b.appendChild(el("div", { "class": "serif", style: "font-size: 25px; line-height: 1.2" }, w[1]));
    b.appendChild(el("div", { style: "font-size: 14px; color: #6B6259" }, w[2]));
    b.appendChild(el("div", { style: "border-top: 1px solid #EDE6DC; padding-top: 12px; font-size: 13px; color: #8A7E72" }, "card: " + w[3]));
    b.appendChild(el("div", { "class": "serif", style: "font-size: 18px; line-height: 1.4; font-style: italic" }, "“" + w[4] + "”"));
    weeks.appendChild(b);
  });

  var convo = document.getElementById("convo");
  [[null, "Interviewer · opening", "What brings you here this week?"],
   ["r", "My son hired a lawn service while I was recovering. They cut it all wrong, and nobody listens."],
   [COL.pink, "Interviewer · card: Someone Needed Me", "Before the surgery, who looked after the lawn? What did it mean to you to be the one doing it?"],
   ["r", "Me, for forty years. People on the street asked me for advice."],
   [COL.yellow, "Interviewer · card: Daily Meeting Place", "You said people asked you for advice. Where would that happen?"],
   ["r", "Out front, mostly. Or at the hardware store on Saturdays. I haven’t been since the surgery."],
   [COL.green, "Interviewer · card: One Busy Day", "Now that someone else does the yard, what fills your Saturdays?"],
   ["r", "Not much. I watch them do it wrong."],
   [null, "Interviewer · closing", "We will stop here for this week. Is there one small thing you would like to try before next time?"],
   ["r", "Maybe walk down to the hardware store."]].forEach(function (m) {
    if (m[0] === "r") {
      var r = el("div", { "class": "reply" });
      r.appendChild(el("span", { style: "font-weight: 600" }, "Robert"));
      r.appendChild(document.createTextNode(" · " + m[1]));
      convo.appendChild(r);
    } else {
      var a = el("div", { "class": "ask", style: m[0] ? "border-left-color: " + m[0] : "" });
      a.appendChild(el("div", { "class": "small", style: "font-size: 12px" }, m[1]));
      a.appendChild(el("div", { "class": "t" }, m[2]));
      convo.appendChild(a);
    }
  });

  var NINE = [
    ["agency", "Making decisions and having control", COL.amber],
    ["feeling valued", "Feeling needed and appreciated", COL.pink],
    ["social presence", "Belonging and connection with people", COL.yellow],
    ["self-efficacy", "Confidence in what one can do", COL.green],
    ["activities", "Daily rhythms and routines", COL.green],
    ["aging process", "Changes in body and mind", COL.blue],
    ["age associations", "What age means, and what is expected", COL.purple],
    ["life satisfaction", "How one feels about life and its direction", COL.olive],
    ["emotions", "Feelings that shape experience", COL.orange]
  ];
  var cov = document.getElementById("coverage");
  NINE.forEach(function (a, k) {
    var on = [1, 2, 4].indexOf(k) !== -1;
    cov.appendChild(el("span", { style: on ? "background: " + a[2] + "; border-color: " + a[2] : "" }));
  });

  var tags = document.getElementById("map-tags");
  [["agency", COL.amber], ["feeling valued", COL.pink], ["aging process", COL.blue], ["social presence", COL.yellow]].forEach(function (t) {
    tags.appendChild(el("span", { "class": "tagpill", style: "background: " + t[1] }, t[0]));
  });

  /* ---------- model ---------- */
  var agents = document.getElementById("agents");
  [["1", "Interviewer · weeks 1–4", "Listens and asks", "Asks bounded, card-based questions across the nine aspects, starting from the person’s own words.", false],
   ["2", "Analyzer", "Finds patterns", "Reads all four sessions for tentative patterns and needs. Every pattern traces back to what the person said.", false],
   ["3", "The person", "Reviews the reading", "Confirms, edits or rejects each pattern. A rejected pattern is dropped.", true],
   ["4", "Recommender", "Suggests next steps", "Works only from confirmed patterns. Offers options, tradeoffs, points to raise with someone, and checked resources.", false]].forEach(function (g) {
    var b = el("div", { "class": "box" + (g[4] ? " hl" : "") });
    b.appendChild(el("div", { "class": "serif", style: "font-size: 34px; line-height: 1; color: #1E2B33" }, g[0]));
    b.appendChild(el("div", { style: "margin-top: 12px; font-size: 12px; letter-spacing: 0.12em; color: #6B6259; text-transform: uppercase" }, g[1]));
    b.appendChild(el("div", { "class": "serif", style: "margin: 4px 0 8px; font-size: 23px" }, g[2]));
    b.appendChild(el("div", { style: "font-size: 15px; color: #4A433C; line-height: 1.55" }, g[3]));
    agents.appendChild(b);
  });

  var contrasts = document.getElementById("contrasts");
  [["Agree with how you first framed the problem.", "Asks about the parts of life around the concern first."],
   ["Answer before it understands.", "Covers all nine aspects over four weeks before offering anything."],
   ["Invent causes and state them as fact.", "Offers a tentative reading that you confirm, edit or reject."],
   ["Give confident advice.", "Shows options and tradeoffs, with uncertainty visible."],
   ["Keep the conversation going without end.", "Works in bounded sessions that close with a step you choose."],
   ["Deepen rumination and dependence.", "Points to people and human help, especially when stakes are high."],
   ["Assume one cultural default.", "Asks you to describe your own context, and lets you change it."],
   ["Make up resources and facts.", "Recommends only checked resources, with no paid listings."]].forEach(function (c) {
    var r = el("div", { "class": "pair" });
    r.appendChild(el("div", { style: "color: #6B6259" }, c[0]));
    r.appendChild(el("div", null, c[1]));
    contrasts.appendChild(r);
  });

  var commitments = document.getElementById("commitments");
  ["It will not diagnose you or claim to know your hidden motives.",
   "It will not keep you talking. Sessions have an end.",
   "It will not decide for you. Every reading can be edited or rejected.",
   "It will not store what you share without asking. You can delete it.",
   "It will not sell your data or take money to recommend a service.",
   "It will point you to people and professional help when a concern is serious."].forEach(function (m) {
    commitments.appendChild(el("div", { style: "border-top: 1px solid #D9CEBF; padding-top: 12px" }, m));
  });

  /* ---------- research ---------- */
  var aspects = document.getElementById("aspects");
  NINE.forEach(function (a) {
    var r = el("div", { "class": "aspect-row" });
    r.appendChild(el("div", { "class": "sq", style: "background: " + a[2] }));
    r.appendChild(el("div", { "class": "n" }, a[0]));
    r.appendChild(el("div", { "class": "l" }, a[1]));
    aspects.appendChild(r);
  });

  var ce = document.getElementById("card-examples");
  [["Someone Needed Me", "images/someone-needed-me.png", "feeling valued", "Before the surgery, who looked after the lawn? What did it mean to you to be the one doing it?"],
   ["One Courageous No", "images/one-courageous-no.png", "agency", "When your son decided to hire the service, were you part of that decision?"],
   ["Changed with Age", "images/changed-with-age.png", "aging process", "What has the surgery changed about what you can do, and what you expect of yourself?"]].forEach(function (e) {
    var b = el("div", { "class": "box", style: "padding: 22px; display: flex; flex-direction: column; gap: 12px" });
    var img = el("img", { src: e[1], alt: e[0] + " card", loading: "lazy", style: "display: block; width: 210px; max-width: 100%; height: auto; margin: -16px auto -10px" });
    b.appendChild(img);
    b.appendChild(el("div", { "class": "small" }, e[2] + " · for Robert"));
    b.appendChild(el("div", { "class": "serif", style: "font-size: 20px; line-height: 1.4" }, "“" + e[3] + "”"));
    ce.appendChild(b);
  });

  var roadmap = document.getElementById("roadmap");
  [["1", "Revise the card deck", "Adapt the prompts for the first transition, and add cards for loss, conflict, and the present and future."],
   ["2", "Build the dataset", "Run a free program for compensated, consenting participants, alongside simulated conversations reviewed by psychologists."],
   ["3", "Train the agents", "Fine-tune open models as interviewer, analyzer and recommender."],
   ["4", "Test against general AI", "Compare with a general-purpose chatbot on clarity, agency, relevance, burden and harm."]].forEach(function (r) {
    var row = el("div", { style: "display: flex; gap: 16px; align-items: flex-start" });
    row.appendChild(el("div", { "class": "dot", style: "border-radius: 17px; background: #F6F5F2" }, r[0]));
    var t = el("div");
    t.appendChild(el("div", { style: "font-weight: 600" }, r[1]));
    t.appendChild(el("div", { style: "font-size: 15px; color: #6B6259" }, r[2]));
    row.appendChild(t);
    roadmap.appendChild(row);
  });

  show(location.hash.slice(1) || "overview");
})();
