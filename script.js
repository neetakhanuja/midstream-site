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
  var TABS = ["overview", "program", "offerings", "research"];
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
  [["1", "Starts from each person’s situation", "whatever they bring to the first session", COL.yellow],
   ["2", "Follows what comes up", "each card opens a different part of life", COL.amber],
   ["3", "Covers all nine parts", "the facilitator returns to the ones not yet discussed", COL.blue],
   ["4", "Ends with a transition map", "and a next step each person chooses", COL.orange]].forEach(function (w) {
    var row = el("div", { style: "display: flex; gap: 14px; align-items: flex-start" });
    row.appendChild(el("div", { "class": "dot", style: "background: " + w[3] }, w[0]));
    var t = el("div");
    t.appendChild(el("div", { style: "font-weight: 600" }, w[1]));
    t.appendChild(el("div", { style: "font-size: 15px; color: #6B6259" }, w[2]));
    row.appendChild(t);
    wp.appendChild(row);
  });

  var OFFERS = [
    ["Workshop", "One 90-minute session", "A small group, a first look at the cards, and at what a change is touching in each person’s life.", COL.yellow],
    ["Midstream program", "Four sessions", "The full program in a small group. All nine parts of life, and a transition map to keep.", COL.amber],
    ["One-to-one", "Individual sessions", "The same approach with a facilitator, for people who prefer to talk privately.", COL.blue]
  ];
  function offerBox(o, full) {
    var b = el("div", { "class": "box", style: "padding: 0; overflow: hidden; display: flex; flex-direction: column" });
    b.appendChild(el("div", { style: "height: 12px; background: " + o[3] }));
    var inner = el("div", { style: "padding: " + (full ? "28px" : "22px") + "; display: flex; flex-direction: column; gap: 6px" });
    inner.appendChild(el("div", { style: "font-size: 12px; letter-spacing: 0.12em; color: #6B6259; text-transform: uppercase" }, o[1]));
    inner.appendChild(el("div", { "class": "serif", style: "font-size: " + (full ? "28px" : "24px") + "; line-height: 1.2" }, o[0]));
    inner.appendChild(el("div", { style: "font-size: 15px; color: #4A433C; line-height: 1.55; margin-top: 4px" }, o[2]));
    b.appendChild(inner);
    return b;
  }
  var op = document.getElementById("offer-preview");
  OFFERS.forEach(function (o) { op.appendChild(offerBox(o, false)); });

  /* ---------- program ---------- */
  var gridBody = document.querySelector("#grid tbody");
  [["feeling valued", COL.pink, ["f", "", "", "r"]],
   ["social presence", COL.yellow, ["f", "", "", ""]],
   ["activities", COL.green, ["f", "r", "", ""]],
   ["agency", COL.amber, ["", "f", "", "r"]],
   ["age associations", COL.purple, ["", "f", "", ""]],
   ["aging process", COL.blue, ["", "", "f", ""]],
   ["self-efficacy", COL.green, ["", "f", "r", ""]],
   ["emotions", COL.orange, ["f", "", "", "r"]],
   ["life satisfaction", COL.olive, ["", "", "", "f"]]].forEach(function (a) {
    var tr = el("tr");
    var th = el("td");
    th.appendChild(el("span", { "class": "sw", style: "background: " + a[1] }));
    th.appendChild(document.createTextNode(a[0]));
    tr.appendChild(th);
    a[2].forEach(function (m, i) {
      var td = el("td");
      if (m === "f") { td.appendChild(el("span", { "class": "mark", style: "background: " + a[1] + "; border-color: " + a[1], "aria-label": "first comes up in session " + (i + 1) })); }
      if (m === "r") { td.appendChild(el("span", { "class": "mark", style: "border-color: " + a[1], "aria-label": "comes back in session " + (i + 1) })); }
      tr.appendChild(td);
    });
    gridBody.appendChild(tr);
  });

  var steps = document.getElementById("session-steps");
  [["1", "Each person says what is on their mind", "Usually the change that brought them, in their own words."],
   ["2", "The facilitator brings in a card", "Chosen to fit what was said, from a part of life not yet discussed."],
   ["3", "Each person answers about their own life", "The group listens and asks. Nobody is told what their story means."],
   ["4", "Everyone leaves with something to try", "A small step, or a question to think about before the next session."]].forEach(function (r) {
    var row = el("div", { style: "display: flex; gap: 16px; align-items: flex-start" });
    row.appendChild(el("div", { "class": "dot", style: "border-radius: 17px; background: #FFF; border: 1px solid #D9CEBF" }, r[0]));
    var t = el("div");
    t.appendChild(el("div", { style: "font-weight: 600" }, r[1]));
    t.appendChild(el("div", { style: "font-size: 15px; color: #6B6259" }, r[2]));
    row.appendChild(t);
    steps.appendChild(row);
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
  var tags = document.getElementById("map-tags");
  [["agency", COL.amber], ["feeling valued", COL.pink], ["aging process", COL.blue], ["social presence", COL.yellow]].forEach(function (t) {
    tags.appendChild(el("span", { "class": "tagpill", style: "background: " + t[1] }, t[0]));
  });

  /* ---------- offerings ---------- */
  var offers = document.getElementById("offerings");
  OFFERS.forEach(function (o) { offers.appendChild(offerBox(o, true)); });

  var commitments = document.getElementById("commitments");
  ["It will not diagnose anyone or guess at hidden motives.",
   "It will not tell people what their situation means. Each person decides.",
   "It will not run without an end. Every program has a set number of sessions.",
   "It will not record or keep what people share without asking.",
   "It will not replace therapy. Sessions are for reflection.",
   "It will point people to professional help when a concern is serious."].forEach(function (m) {
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
  [["1", "Revise the card deck", "Adapt the prompts for transitions in midlife and later life, and add cards for loss, conflict, and the present and future."],
   ["2", "Run free pilot workshops", "Small groups of 6 to 10 people. Ask what they gained and whether they would come back."],
   ["3", "Refine the facilitation", "Write a facilitator guide from what works in the pilots."],
   ["4", "Offer the program", "Workshops, the four-session program and one-to-one sessions, directly and through organizations."]].forEach(function (r) {
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
