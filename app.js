const drills = {
  shadow: {
    title: "影子跟读",
    wpm: 155,
    type: "Shadow this aloud",
    prompts: [
      {
        title: "Stop sounding careful. Start sounding present.",
        text: "I get what you mean, but I would frame it slightly differently: the real issue is not speed itself, it is whether your rhythm lets people follow you without effort.",
        chips: ["thought groups", "contrast stress", "falling tone"],
        cues: [
          "把 but I would 连成 /buh-dai-wud/，不要逐词停顿。",
          "重读 real issue / speed itself / follow you。",
          "最后半句放慢一点，像是在落地结论。"
        ]
      },
      {
        title: "Sound decisive without sounding stiff.",
        text: "That is a fair concern, and I would not dismiss it, but based on what we have seen so far, I think the upside is still worth exploring.",
        chips: ["linking", "soft disagreement", "executive tone"],
        cues: [
          "That is a 读成 /that-sa/，fair concern 后轻停。",
          "not dismiss it 里的 t 可以弱化，但 dismiss 要清楚。",
          "worth exploring 用降调，听起来更坚定。"
        ]
      }
    ]
  },
  speed: {
    title: "语速阶梯",
    wpm: 175,
    type: "Clarity to speed ladder",
    prompts: [
      {
        title: "Say it clean, then say it faster.",
        text: "The fastest way to sound more fluent is to stop over-pronouncing every word and start grouping ideas the way native speakers actually process them.",
        chips: ["120 → 150 → 175 WPM", "chunking", "reduction"],
        cues: [
          "第一遍追求清晰，第二遍缩短功能词，第三遍保持重音不丢。",
          "fastest way / more fluent / over-pronouncing / grouping ideas 是四个重心。",
          "the way native speakers actually process them 一口气完成。"
        ]
      },
      {
        title: "Pressure test your rhythm.",
        text: "If I had to make the decision today, I would focus less on perfect grammar and more on whether my answer lands quickly and naturally.",
        chips: ["decision frame", "speed pressure", "landing"],
        cues: [
          "If I had to 可弱读成 /fai-had-ta/。",
          "less on / more on 做平行对比，节奏要一致。",
          "quickly and naturally 不要拖尾。"
        ]
      }
    ]
  },
  reaction: {
    title: "即兴反应",
    wpm: 165,
    type: "Answer in 20 seconds",
    prompts: [
      {
        title: "Think in English before the sentence is perfect.",
        text: "Someone says: I am not convinced this is the right direction. Respond in English with one acknowledgement, one reason, and one next step.",
        chips: ["acknowledge", "reason", "next step"],
        cues: [
          "开头别翻译：I see why you feel that way.",
          "理由句用 because / what I am seeing is... 快速推进。",
          "结尾给动作：Let us test it with...。"
        ]
      },
      {
        title: "Handle a fast follow-up.",
        text: "Someone asks: Can you give me the short version? Answer in under fifteen seconds without sounding rushed.",
        chips: ["concise answer", "executive summary", "calm speed"],
        cues: [
          "先说 Sure. The short version is...",
          "只给一个核心判断和一个原因。",
          "速度快，但每个重音词要站得住。"
        ]
      }
    ]
  },
  linking: {
    title: "连读弱读",
    wpm: 150,
    type: "Connected speech lab",
    prompts: [
      {
        title: "Make the sentence breathe like English.",
        text: "A lot of it comes down to how you connect your thoughts, not how many advanced words you can fit into one sentence.",
        chips: ["a lot of it", "comes down to", "fit into"],
        cues: [
          "A lot of it 连成 /uh-laa-duh-vit/。",
          "comes down to 里的 to 弱读，不要读得太满。",
          "advanced words 是重心，one sentence 收尾。"
        ]
      },
      {
        title: "Reduce the small words.",
        text: "What I want to do is give you a version that sounds less translated and more like something someone would actually say.",
        chips: ["want to", "give you a", "would actually"],
        cues: [
          "want to do 可读成 /wanna-do/。",
          "give you a version 连接 /giv-yuh-vur-zhun/。",
          "less translated / more like 做强对比。"
        ]
      }
    ]
  }
};

const modeButtons = document.querySelectorAll(".mode");
const modeTitle = document.querySelector("#modeTitle");
const targetWpm = document.querySelector("#targetWpm");
const drillType = document.querySelector("#drillType");
const promptTitle = document.querySelector("#promptTitle");
const promptText = document.querySelector("#promptText");
const focusChips = document.querySelector("#focusChips");
const cueList = document.querySelector("#cueList");
const cueCount = document.querySelector("#cueCount");
const rateSlider = document.querySelector("#rateSlider");
const rateLabel = document.querySelector("#rateLabel");
const listenBtn = document.querySelector("#listenBtn");
const recordBtn = document.querySelector("#recordBtn");
const newPromptBtn = document.querySelector("#newPromptBtn");
const nextStepBtn = document.querySelector("#nextStepBtn");
const transcriptText = document.querySelector("#transcriptText");
const recordStatus = document.querySelector("#recordStatus");
const goalDone = document.querySelector("#goalDone");
const goalBar = document.querySelector("#goalBar");
const sessionTime = document.querySelector("#sessionTime");
const canvas = document.querySelector("#paceCanvas");
const ctx = canvas.getContext("2d");

let currentMode = "shadow";
let promptIndex = 0;
let completed = Number(localStorage.getItem("nativePaceCompleted") || "0");
let recognition = null;
let recording = false;
let startedAt = Date.now();

function renderPrompt() {
  const mode = drills[currentMode];
  const prompt = mode.prompts[promptIndex % mode.prompts.length];

  modeTitle.textContent = mode.title;
  targetWpm.textContent = `${mode.wpm} WPM`;
  drillType.textContent = mode.type;
  promptTitle.textContent = prompt.title;
  promptText.textContent = prompt.text;
  focusChips.innerHTML = prompt.chips.map((chip) => `<span>${chip}</span>`).join("");
  cueList.innerHTML = prompt.cues.map((cue) => `<li>${cue}</li>`).join("");
  cueCount.textContent = `${prompt.cues.length} cues`;
  drawPace();
}

function drawPace() {
  const width = canvas.width;
  const height = canvas.height;
  const rate = Number(rateSlider.value);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#15242a";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i += 1) {
    const y = (height / 6) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const words = promptText.textContent.split(/\s+/).length;
  const bars = Math.min(46, Math.max(26, words * 1.35));
  for (let i = 0; i < bars; i += 1) {
    const x = (width / bars) * i + 8;
    const emphasis = i % 7 === 0 || i % 11 === 0;
    const h = (emphasis ? 92 : 48) * (0.86 + Math.sin(i * 1.7) * 0.18) * rate;
    ctx.fillStyle = emphasis ? "#f0b84c" : i % 3 === 0 ? "#53b8a9" : "#d96c65";
    ctx.fillRect(x, height / 2 - h / 2, Math.max(5, width / bars - 12), h);
  }

  ctx.fillStyle = "rgba(255,255,255,.78)";
  ctx.font = "700 18px Inter, sans-serif";
  ctx.fillText(`${Math.round(drills[currentMode].wpm * rate)} WPM rhythm map`, 22, 34);
}

function speakPrompt() {
  const utterance = new SpeechSynthesisUtterance(promptText.textContent);
  utterance.lang = "en-US";
  utterance.rate = Number(rateSlider.value);
  utterance.pitch = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function setupRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const instance = new SpeechRecognition();
  instance.lang = "en-US";
  instance.continuous = true;
  instance.interimResults = true;
  instance.onresult = (event) => {
    const text = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ")
      .trim();
    transcriptText.textContent = text || "Listening...";
  };
  instance.onend = () => {
    recording = false;
    recordBtn.classList.remove("recording");
    recordBtn.textContent = "开始录音";
    recordStatus.textContent = "已停止";
  };
  return instance;
}

function toggleRecording() {
  if (!recognition) {
    transcriptText.textContent = "这个浏览器暂不支持语音识别。可以使用 Chrome 或 Edge 打开本页。";
    return;
  }

  if (recording) {
    recognition.stop();
    return;
  }

  transcriptText.textContent = "Listening...";
  recordStatus.textContent = "录音中";
  recordBtn.classList.add("recording");
  recordBtn.textContent = "停止录音";
  recording = true;
  recognition.start();
}

function updateGoal() {
  completed = Math.min(5, completed);
  goalDone.textContent = completed;
  goalBar.style.width = `${(completed / 5) * 100}%`;
  localStorage.setItem("nativePaceCompleted", String(completed));
}

function completeRound() {
  completed += 1;
  updateGoal();
  promptIndex += 1;
  renderPrompt();
}

function updateClock() {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  sessionTime.textContent = `${minutes}:${seconds}`;
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modeButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    currentMode = button.dataset.mode;
    promptIndex = 0;
    renderPrompt();
  });
});

rateSlider.addEventListener("input", () => {
  rateLabel.textContent = `${Number(rateSlider.value).toFixed(2)}x`;
  drawPace();
});

listenBtn.addEventListener("click", speakPrompt);
recordBtn.addEventListener("click", toggleRecording);
newPromptBtn.addEventListener("click", () => {
  promptIndex += 1;
  renderPrompt();
});
nextStepBtn.addEventListener("click", completeRound);

recognition = setupRecognition();
renderPrompt();
updateGoal();
setInterval(updateClock, 1000);
