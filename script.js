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
  var TABS = ["overview", "how", "model", "research", "participate"];
  function show(tab, scrollId) {
    if (tab === "program") { tab = "how"; }
    if (tab === "offerings") { tab = "participate"; }
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
    var stage = t.getAttribute("data-stage");
    if (stage) { goStage(parseInt(stage, 10)); }
    show(tab, t.getAttribute("data-scroll"));
  });
  window.addEventListener("popstate", function () { show(location.hash.slice(1)); });

  /* ---------- currents (overview) ---------- */
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

  /* ---------- journey preview (overview) ---------- */
  var STAGES = [
    ["Begin with a life change", "Choose or describe the change, and learn how the process works."],
    ["Structured conversations", "Questions follow a research-based framework, adapted to your words."],
    ["Understanding across sessions", "Later conversations build on earlier ones over several weeks."],
    ["Review possible patterns", "Confirm, change or reject each tentative interpretation."],
    ["Explore next steps", "Consider possible directions and their tradeoffs. You decide."],
    ["Revisit and continue", "Keep a Transition Map of what you explored and chose."]
  ];
  var jp = document.getElementById("journey-preview");
  STAGES.forEach(function (s, i) {
    var b = el("button", { type: "button", "class": "box" + (i === 3 ? " hl" : ""), "data-go": "how", "data-stage": String(i + 1), style: "text-align: left; display: flex; flex-direction: column; gap: 6px; cursor: pointer; font: inherit; color: inherit" });
    b.appendChild(el("div", { "class": "small" }, "Stage " + (i + 1)));
    b.appendChild(el("div", { "class": "serif", style: "font-size: 23px; line-height: 1.2" }, s[0]));
    b.appendChild(el("div", { style: "font-size: 15px; color: #4A433C; line-height: 1.5" }, s[1]));
    jp.appendChild(b);
  });

  var flow = document.getElementById("flow");
  [["Interviewer", "Guides structured conversations across sessions.", false],
   ["Analyzer", "Drafts tentative patterns from what the person said.", false],
   ["The person reviews", "Confirms, modifies or rejects each pattern.", true],
   ["Recommender", "Suggests possible next steps from approved patterns.", false]].forEach(function (f, i, arr) {
    var b = el("div", { "class": "box" + (f[2] ? " hl" : "") });
    b.appendChild(el("div", { style: "font-weight: 600; font-size: 17px" }, f[0]));
    b.appendChild(el("div", { style: "font-size: 15px; color: #4A433C; margin-top: 4px" }, f[1]));
    flow.appendChild(b);
    if (i < arr.length - 1) { flow.appendChild(el("div", { "class": "arrow", "aria-hidden": "true" }, "→")); }
  });

  /* ---------- how it works: stepper ---------- */
  var stepBox = document.getElementById("journey-steps");
  var stepBtns = STAGES.map(function (s, i) {
    var b = el("button", { type: "button", role: "tab", "aria-selected": "false", "class": i === 3 ? "review-step" : "" }, (i + 1) + " · " + s[0]);
    b.addEventListener("click", function () { goStage(i + 1); });
    stepBox.appendChild(b);
    return b;
  });
  var current = 1;
  function goStage(n) {
    current = Math.max(1, Math.min(6, n));
    for (var i = 1; i <= 6; i++) { document.getElementById("stage-" + i).hidden = i !== current; }
    stepBtns.forEach(function (b, i) { b.setAttribute("aria-selected", i + 1 === current ? "true" : "false"); });
    document.getElementById("stage-prev").disabled = current === 1;
    var next = document.getElementById("stage-next");
    next.textContent = current === 6 ? "Back to the start" : "Next stage →";
  }
  document.getElementById("stage-prev").addEventListener("click", function () { goStage(current - 1); });
  document.getElementById("stage-next").addEventListener("click", function () {
    goStage(current === 6 ? 1 : current + 1);
    document.getElementById("journey-steps").scrollIntoView({ block: "nearest" });
  });

  // stage 1
  var tc = document.getElementById("transition-chips");
  ["Retirement", "Changing family responsibilities", "Relocation", "Caregiving", "A change in physical abilities", "A new stage of life"].forEach(function (t) {
    var on = t === "A change in physical abilities";
    tc.appendChild(el("span", { "class": "chip", "aria-pressed": on ? "true" : "false", style: "display: inline-flex; align-items: center; cursor: default" }, t));
  });

  // stage 2
  var convo = document.getElementById("convo");
  [["m", "Before the surgery, what did looking after the house mean to you?"],
   ["r", "I took care of everything. Even the neighbors used to come to me when something needed fixing."],
   ["m", "What has changed about how decisions are made around the house?"],
   ["r", "My son handles most things now. I know he means well, but sometimes I wish he would ask me first."],
   ["m", "Is there something you particularly miss being able to do yourself?"],
   ["r", "The edges of the lawn. I always did those by hand."]].forEach(function (m) {
    if (m[0] === "r") {
      var r = el("div", { "class": "reply" });
      r.appendChild(el("span", { style: "font-weight: 600" }, "Robert"));
      r.appendChild(document.createTextNode(" · " + m[1]));
      convo.appendChild(r);
    } else {
      var a = el("div", { "class": "ask" });
      a.appendChild(el("div", { "class": "small", style: "font-size: 12px" }, "Midstream"));
      a.appendChild(el("div", { "class": "t" }, m[1]));
      convo.appendChild(a);
    }
  });

  // stage 3
  var gridBody = document.querySelector("#grid tbody");
  [["feeling valued", COL.pink, ["f", "", "", "r"]],
   ["agency", COL.amber, ["f", "r", "", "r"]],
   ["social presence", COL.yellow, ["", "f", "", ""]],
   ["activities", COL.green, ["", "f", "r", ""]],
   ["self-efficacy", COL.green, ["f", "", "r", ""]],
   ["aging process", COL.blue, ["", "", "f", ""]],
   ["age associations", COL.purple, ["", "d", "n", ""]],
   ["emotions", COL.orange, ["", "f", "", "r"]],
   ["life satisfaction", COL.olive, ["", "", "", "f"]]].forEach(function (a) {
    var tr = el("tr");
    var th = el("td");
    th.appendChild(el("span", { "class": "sw", style: "background: " + a[1] }));
    th.appendChild(document.createTextNode(a[0]));
    tr.appendChild(th);
    a[2].forEach(function (m, i) {
      var td = el("td");
      var s = " in session " + (i + 1);
      if (m === "f") { td.appendChild(el("span", { "class": "mark", style: "background: " + a[1] + "; border-color: " + a[1], "aria-label": "explored" + s })); }
      if (m === "r") { td.appendChild(el("span", { "class": "mark", style: "border-color: " + a[1], "aria-label": "revisited" + s })); }
      if (m === "d") { td.appendChild(el("span", { "class": "mark def", style: "border-color: " + a[1], "aria-label": "deferred" + s })); }
      if (m === "n") { td.appendChild(el("span", { "class": "lessrel", "aria-label": "marked less relevant" + s }, "×")); }
      tr.appendChild(td);
    });
    gridBody.appendChild(tr);
  });

  var cont = document.getElementById("continuity");
  [["Session 2", "“Last week you mentioned the neighbors used to come to you. Do you still see them?”"],
   ["Session 3", "“You said you always did the edges by hand. What does your knee allow right now?”"],
   ["Session 4", "“We have not talked about how you see the year ahead. Would you like to?”"]].forEach(function (c) {
    var d = el("div", { "class": "ask" });
    d.appendChild(el("div", { "class": "small", style: "font-size: 12px" }, c[0]));
    d.appendChild(el("div", { "class": "t" }, c[1]));
    cont.appendChild(d);
  });

  // stage 4
  var said = document.getElementById("said");
  [["Session 1", "“My son handles most things now. I wish he would ask me first.”"],
   ["Session 1", "“Even the neighbors used to come to me when something needed fixing.”"],
   ["Session 1", "“The edges of the lawn. I always did those by hand.”"]].forEach(function (q) {
    var d = el("div", { "class": "said" });
    d.appendChild(el("div", { "class": "small", style: "font-size: 12px" }, q[0]));
    d.appendChild(el("div", { style: "font-size: 16px" }, q[1]));
    said.appendChild(d);
  });
  var inf = document.getElementById("inferred");
  ["Decisions about the house are now made without him.", "He has fewer ways to contribute through things he values."].forEach(function (t) {
    var d = el("div", { "class": "inferred" });
    d.appendChild(el("div", { "class": "small", style: "font-size: 12px" }, "Tentative"));
    d.appendChild(el("div", { style: "font-size: 16px" }, t));
    inf.appendChild(d);
  });
  var decide = document.getElementById("decide");
  var result = document.getElementById("decide-result");
  var decisionBtns = [];
  [["Confirm", "Robert confirms. The pattern goes on his Transition Map."],
   ["Modify", "Robert edits it: “My son means well. I want to be asked about the house, not about everything.” The edited version goes on his map."],
   ["Reject", "Robert rejects it. The pattern is dropped and does not inform any recommendation."]].forEach(function (o) {
    var b = el("button", { type: "button", "class": "chip", "aria-pressed": "false" }, o[0]);
    b.addEventListener("click", function () {
      decisionBtns.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      result.textContent = o[1];
    });
    decisionBtns.push(b);
    decide.appendChild(b);
  });

  // stage 5
  var options = document.getElementById("options");
  [["Talk with his son about which household decisions he wants to stay involved in.", "May feel awkward to raise. Could prevent more friction later.", true],
   ["Find activities he can take part in during recovery, within what his knee allows.", "Depends on his recovery plan. Worth checking with his care team.", false],
   ["Reconnect with familiar people and routines, such as Saturdays at the hardware store.", "May need help getting there while he recovers.", false]].forEach(function (o) {
    var b = el("div", { "class": "box", style: "display: flex; flex-direction: column; gap: 10px" + (o[2] ? "; border: 2px solid #1E2B33" : "") });
    b.appendChild(el("div", { "class": "serif", style: "font-size: 20px; line-height: 1.4" }, o[0]));
    b.appendChild(el("div", { style: "font-size: 15px; color: #6B6259" }, "Tradeoff: " + o[1]));
    if (o[2]) { b.appendChild(el("div", { "class": "small", style: "color: #1E2B33; font-weight: 600" }, "Robert chose this")); }
    options.appendChild(b);
  });

  // stage 6
  var tags = document.getElementById("map-tags");
  [["feeling valued", COL.pink], ["agency", COL.amber], ["self-efficacy", COL.green], ["activities", COL.green], ["aging process", COL.blue], ["social presence", COL.yellow], ["emotions", COL.orange], ["life satisfaction", COL.olive]].forEach(function (t) {
    tags.appendChild(el("span", { "class": "tagpill", style: "background: " + t[1] }, t[0]));
  });

  goStage(1);

  // program summary
  var wp = document.getElementById("week-preview");
  [["1", "Starts from the person’s own words", "whatever they bring to the first session", COL.yellow],
   ["2", "Follows what comes up", "each question opens a different part of life", COL.amber],
   ["3", "Keeps track of the framework", "and returns to the parts not yet explored", COL.blue],
   ["4", "Ends with a review", "tentative patterns first, then possible next steps", COL.orange]].forEach(function (w) {
    var row = el("div", { style: "display: flex; gap: 14px; align-items: flex-start" });
    row.appendChild(el("div", { "class": "dot", style: "background: " + w[3] }, w[0]));
    var t = el("div");
    t.appendChild(el("div", { style: "font-weight: 600" }, w[1]));
    t.appendChild(el("div", { style: "font-size: 15px; color: #6B6259" }, w[2]));
    row.appendChild(t);
    wp.appendChild(row);
  });

  /* ---------- model ---------- */
  var agents = document.getElementById("agents");
  [["1", "Interviewer · across sessions", "Asks and listens", "Conducts conversations guided by an adaptable, research-informed framework. Explores relevant domains over several sessions and uses earlier answers to shape new questions.", false],
   ["2", "Analyzer", "Drafts patterns", "Reviews what was shared across sessions and drafts tentative interpretations of patterns, concerns, priorities and barriers, each linked to the person’s own words.", false],
   ["3", "The person", "Reviews", "Confirms, modifies or rejects each interpretation. A rejected interpretation is dropped.", true],
   ["4", "Recommender", "Suggests next steps", "Works only from approved interpretations. Proposes possible actions, tradeoffs, reflection exercises and sources of support.", false]].forEach(function (a) {
    var b = el("div", { "class": "box" + (a[4] ? " hl" : "") });
    b.appendChild(el("div", { "class": "serif", style: "font-size: 34px; line-height: 1; color: #1E2B33" }, a[0]));
    b.appendChild(el("div", { style: "margin-top: 12px; font-size: 12px; letter-spacing: 0.12em; color: #6B6259; text-transform: uppercase" }, a[1]));
    b.appendChild(el("div", { "class": "serif", style: "margin: 4px 0 8px; font-size: 23px" }, a[2]));
    b.appendChild(el("div", { style: "font-size: 15px; color: #4A433C; line-height: 1.55" }, a[3]));
    agents.appendChild(b);
  });

  var principles = document.getElementById("principles");
  [["A research-derived framework", "Questions follow an explicit structure: nine dimensions from research on self-perceptions of aging, each with reflection prompts. The framework will need adaptation and evaluation for other populations and transitions."],
   ["Context across sessions", "With consent, the system keeps a record across sessions, so later conversations build on earlier ones."],
   ["Interpretive uncertainty", "Interpretations are tentative. The system separates what the person said from what it infers, and shows which statements support each observation."],
   ["Participant agency", "The person controls the interpretation and every decision that follows."],
   ["Cultural context", "The framework comes from research with older adults in urban India. How people describe aging and family differs across cultures."]].forEach(function (p) {
    var r = el("div", { "class": "pair" });
    r.appendChild(el("div", { style: "font-weight: 600" }, p[0]));
    r.appendChild(el("div", { "class": "body" }, p[1]));
    principles.appendChild(r);
  });

  var commitments = document.getElementById("commitments");
  ["It will not diagnose you or claim to know your hidden motives.",
   "It will not keep you talking. Sessions have an end.",
   "It will not decide for you. Every interpretation can be edited or rejected.",
   "It will not store what you share without asking. You can delete it.",
   "It will not sell your data or take money to recommend a service.",
   "It will point you to people and professional help when a concern is serious."].forEach(function (m) {
    commitments.appendChild(el("div", { style: "border-top: 1px solid #D9CEBF; padding-top: 12px" }, m));
  });

  /* ---------- research ---------- */
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
    b.appendChild(el("img", { src: e[1], alt: e[0] + " card", style: "display: block; width: 210px; max-width: 100%; height: auto; margin: -16px auto -10px" }));
    b.appendChild(el("div", { "class": "small" }, e[2] + " · for Robert"));
    b.appendChild(el("div", { "class": "serif", style: "font-size: 20px; line-height: 1.4" }, "“" + e[3] + "”"));
    ce.appendChild(b);
  });

  /* ---------- participate ---------- */
  var roadmap = document.getElementById("roadmap");
  [["1", "Refine the framework", "Use facilitated sessions to understand how people experience transitions, and adapt the card prompts."],
   ["2", "Prototype the conversation flow", "Human facilitators enact the Interviewer and Analyzer roles, to test the structure and the interpretations before anything is automated."],
   ["3", "Customer discovery", "Learn who would use Midstream, in which transitions, and who would pay for it."],
   ["4", "Build and evaluate", "Prototype the three functions and evaluate usefulness, accuracy of interpretations, burden and possible harm."]].forEach(function (r) {
    var row = el("div", { style: "display: flex; gap: 16px; align-items: flex-start" });
    row.appendChild(el("div", { "class": "dot", style: "border-radius: 17px; background: #FFF; border: 1px solid #D9CEBF" }, r[0]));
    var t = el("div");
    t.appendChild(el("div", { style: "font-weight: 600" }, r[1]));
    t.appendChild(el("div", { style: "font-size: 15px; color: #6B6259" }, r[2]));
    row.appendChild(t);
    roadmap.appendChild(row);
  });

  var methods = document.getElementById("methods");
  ["Explore how people experience life transitions.",
   "Refine the research-derived interviewing framework.",
   "Develop and test the structure of conversations.",
   "Understand which interpretations people find meaningful.",
   "Evaluate the proposed system and its usefulness."].forEach(function (m) {
    methods.appendChild(el("div", { "class": "body" }, m));
  });

  show(location.hash.slice(1) || "overview");
})();
