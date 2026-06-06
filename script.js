const SHEETS_URL = "https://script.google.com/macros/s/AKfycbzUYLWJJ8k1Nxr-8BAlMNHgQd22DAkHcovWRzK9NmFmY9az-thj3hOv91ecmeEHsjAO/exec";

function sendToSheets(data) {
  if (!SHEETS_URL) return;
  fetch(SHEETS_URL, {
    method: "POST",
    body: JSON.stringify(data)
  }).catch(() => {});
}

const prompts = [
  {
    id: 1,
    category: "Loneliness",
    prompt: "Recently I have been feeling isolated and feel like no one really notices.",
    ai: "I'm really sorry you've been feeling this way lately. Feeling isolated can make it seem like no one notices, but your presence genuinely matters more than you think. There are people who care about you even if it doesn't always feel obvious right now.",
    human: "I'm really sorry to hear that and I appreciate you telling me you're feeling this way. Maybe it would be a good idea to think of some activities that you enjoy doing, even if it is on your own. It might also be a good idea to reach out to your friends and family and tell them how you have been feeling."
  },
  {
    id: 2,
    category: "Academic Burnout",
    prompt: "No matter how much effort I put into school I feel like I still am not doing enough and that I am behind.",
    ai: "I know how exhausting it can feel to keep putting in effort and still feel like you're falling behind. But struggling doesn't mean you're failing, and your progress is not defined by comparing yourself to everyone else. The fact that you keep trying, even when it's hard, says a lot about your determination.",
    human: "I'm sorry to hear that, schools often aren't built in a way that accounts for all different work ethics and otherwise. Maybe it'd help to have accommodations — consider reaching out to your counselor, it might be wise to have some extra time on assignments."
  },
  {
    id: 3,
    category: "Anxiety",
    prompt: "Anytime I talk to someone new I always overthink the conversation and leave feeling not the best and it's exhausting.",
    ai: "That sounds so exhausting, and I know how easy it is to replay every little thing after talking to someone new. But I promise you're probably being way harder on yourself than anyone else is. You don't have to be perfect or say everything perfectly for people to enjoy being around you.",
    human: "I know it feels really exhausting. This is extremely common and often times people feel this way. Anytime you begin to overthink, you should try to think about the other person, and how they probably felt the same way."
  },
  {
    id: 4,
    category: "Relationship Conflict",
    prompt: "I feel like the main people around me never really listen to me when I try to talk about how I'm feeling.",
    ai: "It honestly sucks when you try to open up and it feels like the people around you don't fully hear you. Just know your feelings are valid, and you deserve people who will actually sit with you, listen, and care about what's going on in your head.",
    human: "I'm so sorry, you should start to consider if these are the people who you really want in your life. If you have tried to talk to them multiple times maybe you should begin to find a new main group of people who respect and love you."
  },
  {
    id: 5,
    category: "Insecurity",
    prompt: "I can't help but compare myself to others and feel like others are doing better than me.",
    ai: "I know how hard it is not to compare yourself to other people, especially when it feels like everyone else has things figured out. But you're only seeing the parts of their lives they choose to show, not their struggles. You're actually doing better than you give yourself credit for, and your progress doesn't mean less just because someone else is on a different path.",
    human: "Can I ask what's making you feel like others are doing better than you? It's easy to compare yourself to others but I think it's important to remember life is your own personal journey and there's no one-size-fits-all method. Doing your best is all you can really do. If you give yourself grace, that will always be good enough."
  },
  {
    id: 6,
    category: "Rejection",
    prompt: "I got rejected from a job I really wanted and can't stop thinking about it and I feel really discouraged.",
    ai: "I'm really sorry, that kind of rejection can hurt a lot, especially when you were genuinely excited about it. But it doesn't mean you weren't good enough, just that this one opportunity didn't work out. You still have so much ahead of you, even if it doesn't feel like it in this moment.",
    human: "I'm sorry to hear that, it is always hard when things don't go according to plan, especially when it is something you worked hard for. In these moments it is important to remember that everything happens for a reason and that this rejection will be a redirection for you."
  },
  {
    id: 7,
    category: "Stress",
    prompt: "Lately a lot of things in my life have been feeling really overwhelming and stressful and I don't know how to handle it.",
    ai: "I'm really sorry things have been feeling so overwhelming lately. When everything piles up at once, it can honestly feel like there's no clear way to even start dealing with it, and that's exhausting. You don't have to figure it all out at once, just getting through things is enough right now.",
    human: "I'm so sorry you've been feeling that way, I know how hard it is when so much is happening around you all at once and you feel like you can't breathe. Some things that help when feeling overwhelmed is trying to slow down and being mindful of the present moment rather than thinking about everything going on. Take things one step at a time."
  },
  {
    id: 8,
    category: "Uncertainty",
    prompt: "I feel really lost when thinking about my future.",
    ai: "I'm really sorry you're feeling lost about your future. You don't have to have it all figured out right now, even though it can feel like you're supposed to. It's okay to take things step by step and just focus on what feels manageable in the moment.",
    human: "Thinking about the future is really scary, and it's normal, especially at your age, to feel uncertain. Remind yourself you don't need to have everything figured out all at once and thinking about your present is enough. Everything will work out naturally and you are taking the right steps to having a great future ahead of you."
  }
];

// ── State ──
let trials = [];
let currentIndex = 0;
let userAnswers = [];
let currentTrial = null;
let selectedAI = null;
let ratings = {};
let selectedConf = null;

// ── DOM refs ──
const screens = {
  start: document.getElementById("start-screen"),
  quiz: document.getElementById("quiz-screen"),
  results: document.getElementById("results-screen")
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Consent gate ──
const consentBox = document.getElementById("consent-checkbox");
const startBtn = document.getElementById("start-btn");
consentBox.addEventListener("change", () => {
  startBtn.disabled = !consentBox.checked;
});

// ── Helpers ──
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildTrials() {
  return shuffle(prompts).map(item => {
    const aiFirst = Math.random() < 0.5;
    return {
      ...item,
      responseA: aiFirst ? item.ai : item.human,
      responseB: aiFirst ? item.human : item.ai,
      actualAI: aiFirst ? "A" : "B"
    };
  });
}

// ── Start ──
startBtn.addEventListener("click", () => {
  trials = buildTrials();
  currentIndex = 0;
  userAnswers = [];
  showTrial();
  showScreen("quiz");
});

// ── Show trial ──
function showTrial() {
  currentTrial = trials[currentIndex];
  selectedAI = null;
  ratings = {};
  selectedConf = null;

  const pct = Math.round(((currentIndex + 1) / trials.length) * 100);
  document.getElementById("progress-text").textContent = `Prompt ${currentIndex + 1} of ${trials.length}  ·  ${pct}%`;
  document.getElementById("progress-fill").style.width = `${pct}%`;
  document.getElementById("prompt-text").textContent = `"${currentTrial.prompt}"`;
  document.getElementById("response-a-text").textContent = currentTrial.responseA;
  document.getElementById("response-b-text").textContent = currentTrial.responseB;
  document.getElementById("error-message").textContent = "";

  // Reset response card selection
  document.querySelectorAll(".response-card").forEach(card => {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  });

  // Reset A/B buttons
  document.querySelectorAll(".ab-btn").forEach(btn => btn.classList.remove("selected"));

  // Reset confidence buttons
  document.querySelectorAll(".conf-btn").forEach(btn => btn.classList.remove("selected"));
}

// ── Clickable response cards (= AI guess) ──
document.querySelectorAll(".response-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".response-card").forEach(c => {
      c.classList.remove("selected");
      c.setAttribute("aria-pressed", "false");
    });
    card.classList.add("selected");
    card.setAttribute("aria-pressed", "true");
    selectedAI = card.dataset.choice;
    document.getElementById("error-message").textContent = "";
  });

  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); }
  });
});

// ── A/B rating buttons ──
document.querySelectorAll(".ab-group").forEach(group => {
  group.querySelectorAll(".ab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      group.querySelectorAll(".ab-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      ratings[group.dataset.group] = btn.dataset.val;
    });
  });
});

// ── Confidence buttons ──
document.querySelectorAll(".conf-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".conf-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedConf = btn.dataset.val;
  });
});

// ── Submit ──
document.getElementById("submit-btn").addEventListener("click", () => {
  if (!selectedAI) {
    document.getElementById("error-message").textContent = "Please click a response card to make your AI guess.";
    return;
  }
  if (!ratings.empathy || !ratings.supportive || !ratings.preference) {
    document.getElementById("error-message").textContent = "Please answer all four rating questions.";
    return;
  }
  if (!selectedConf) {
    document.getElementById("error-message").textContent = "Please select a confidence level (1–5).";
    return;
  }

  const correct = selectedAI === currentTrial.actualAI;

  const answer = {
    timestamp: new Date().toISOString(),
    promptId: currentTrial.id,
    category: currentTrial.category,
    responseOrder: currentTrial.actualAI === "A" ? "AI=A,Human=B" : "AI=B,Human=A",
    userGuess: selectedAI,
    actualAI: currentTrial.actualAI,
    correct,
    empathyRating: ratings.empathy,
    supportiveRating: ratings.supportive,
    preference: ratings.preference,
    confidence: selectedConf
  };

  userAnswers.push(answer);
  saveAnswer(answer);
  sendToSheets(answer);

  if (currentIndex >= trials.length - 1) {
    showResults();
    showScreen("results");
  } else {
    currentIndex++;
    showTrial();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// ── Results ──
function showResults() {
  const correctCount = userAnswers.filter(a => a.correct).length;
  const accuracy = Math.round((correctCount / userAnswers.length) * 100);

  document.getElementById("score-text").textContent =
    `You correctly identified the AI response ${correctCount} out of ${userAnswers.length} times.`;
  document.getElementById("accuracy-stat").textContent = `${accuracy}%`;
  document.getElementById("correct-stat").textContent = correctCount;
  document.getElementById("total-stat").textContent = userAnswers.length;

  const list = document.getElementById("breakdown-list");
  list.innerHTML = "";

  userAnswers.forEach(a => {
    const row = document.createElement("div");
    row.className = "breakdown-row";
    row.innerHTML = `
      <div class="breakdown-left">
        <div class="breakdown-cat">${a.category}</div>
        <div class="breakdown-detail">
          You picked Response ${a.userGuess} as AI &nbsp;·&nbsp; AI was Response ${a.actualAI}
          &nbsp;·&nbsp; Empathy: ${a.empathyRating} &nbsp;·&nbsp; Support: ${a.supportiveRating}
          &nbsp;·&nbsp; Preferred: ${a.preference}
          &nbsp;·&nbsp; Confidence: ${a.confidence}/5
        </div>
      </div>
      <span class="result-badge ${a.correct ? "correct" : "incorrect"}">${a.correct ? "Correct" : "Incorrect"}</span>
    `;
    list.appendChild(row);
  });
}

// ── Persist ──
function saveAnswer(answer) {
  const saved = JSON.parse(localStorage.getItem("humanAiResults") || "[]");
  saved.push(answer);
  localStorage.setItem("humanAiResults", JSON.stringify(saved));
}

// ── Download CSV ──
document.getElementById("download-btn").addEventListener("click", () => {
  const saved = JSON.parse(localStorage.getItem("humanAiResults") || "[]");
  if (!saved.length) return;

  const headers = Object.keys(saved[0]);
  const rows = saved.map(obj =>
    headers.map(h => `"${String(obj[h]).replaceAll('"', '""')}"`).join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "human-ai-study-results.csv";
  link.click();
  URL.revokeObjectURL(url);
});

// ── Restart ──
document.getElementById("restart-btn").addEventListener("click", () => {
  trials = buildTrials();
  currentIndex = 0;
  userAnswers = [];
  showTrial();
  showScreen("quiz");
});
