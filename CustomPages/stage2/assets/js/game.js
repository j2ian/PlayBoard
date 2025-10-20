/**
 * 聰明購物遊戲 - Stage 2
 */
class CookingGame {
  constructor() {
    // 遊戲設定
    this.config = {
      startingTime: 45,
      warningTime: 15,
      hintDuration: 0,
      dishHintDuration: 5000,
      maxIngredients: 8,
      totalDishes: 5,
      audioVolume: 0.2,
    };

    // 料理配方（食材編號）
    this.recipes = {
      1: [11, 13, 33, 41],
      2: [13, 22, 23, 42],
      3: [32, 35, 41, 42],
      4: [22, 14, 43, 45, 13, 35],
      5: [11, 15, 23, 24, 34, 41, 42],
    };

    // 成績卡片圖片
    this.cardImages = {
      0: "card_result.png",
      1: "card_result_bronze.png",
      2: "card_result_silver.png",
      3: "card_result_gold.png",
      4: "card_result_platinum.png",
      5: "card_result_diamond.png",
    };

    // 遊戲狀態
    this.state = {
      score: 0,
      scoreDump: 0,
      time: this.config.startingTime,
      currentPhase: 1,
      selectedIngredients: 0,
    };

    // DOM 元素
    this.elements = {};

    // 計時器
    this.timers = { countdown: null };

    // YouTube 播放器
    this.ytPlayer = null;

    this.init();
  }

  init() {
    this.cacheElements();
    this.setupEventListeners();
    //this.loadYouTubeAPI();
    this.playAudio();
  }

  cacheElements() {
    this.elements = {
      intro: document.getElementById("intro"),
      btnSetGame: document.getElementById("btnSetGame"),
      game: document.getElementById("game"),
      hintContainer: document.getElementById("hintContainer"),
      countdown: document.getElementById("countdown"),
      boxEmpty: document.getElementById("boxEmpty"),
      qText: document.getElementById("Q_text"),
      qImg: document.getElementById("Q_img"),
      result1: document.getElementById("result1"),
      result2: document.getElementById("result2"),
      result3: document.getElementById("result3"),
      card: document.getElementById("card"),
      scoreDump: document.getElementById("scoreDump"),
      score: document.getElementById("score"),
      bkMusic: document.getElementById("bkMusic"),
      audioIntro: document.getElementById("audio_intro"),
      finishStage: document.getElementById("finish_stage"),
    };

    // 快取提示和檢查標記
    for (let i = 1; i <= 5; i++) {
      this.elements[`hint${i}`] = document.getElementById(`hint${i}`);
      this.elements[`Q${i}check`] = document.getElementById(`Q${i}check`);
    }
  }

  setupEventListeners() {
    // 開始按鈕
    document.querySelectorAll("#btnSetGame").forEach((btn) => {
      btn.addEventListener("click", () => this.startGame());
    });

    // 食材按鈕（用事件委派）
    document.querySelector(".container1").addEventListener("click", (e) => {
      const btn = e.target.closest(".button[data-food]");
      if (btn) this.addIngredient(parseInt(btn.dataset.food));
    });

    // 完成料理按鈕
    document
      .getElementById("btn_finishDish")
      .addEventListener("click", () => this.finishDish());

    // 結果頁面按鈕
    document.querySelectorAll("#result1 .button").forEach((btn) => {
      btn.addEventListener("click", () => this.showResult(2));
    });
    document.querySelectorAll("#result2 .button").forEach((btn) => {
      btn.addEventListener("click", () => this.showResult(3));
    });

    // 完成按鈕
    // this.elements.finishStage.addEventListener("click", () => this.finish());
  }

  loadYouTubeAPI() {
    const script = document.createElement("script");
    script.src = `https://www.youtube.com/iframe_api?v=${Date.now()}`;
    document.head.appendChild(script);
    window.onYouTubeIframeAPIReady = () => {
      this.ytPlayer = new YT.Player("player", {
        videoId: "Xq3Udaw_VSs",
        events: {
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              this.elements.finishStage.removeAttribute("hidden");
            }
          },
        },
      });
    };
  }

  playAudio() {
    this.elements.bkMusic.loop = true;
    this.elements.bkMusic.volume = this.config.audioVolume;
    this.elements.audioIntro.volume = this.config.audioVolume;
    this.elements.bkMusic.play().catch((e) => console.log("音頻播放失敗:", e));
    this.elements.audioIntro
      .play()
      .catch((e) => console.log("介紹音頻播放失敗:", e));
  }

  startGame() {
    console.log(this.elements.btnSetGame.dataset.hint);

    if (this.elements.btnSetGame.dataset.hint == 0) {
      this.elements.audioIntro.pause();
      document.getElementById("mainHint").style.display = "block";
      this.elements.btnSetGame.dataset.hint = 1;
    } else {
      this.elements.intro.style.display = "none";
      setTimeout(() => this.setGame(), this.config.hintDuration);
    }
  }

  setGame() {
    this.setLevel();
  }

  setLevel() {
    // 清空食材盒
    this.clearIngredientBoxes();
    this.state.selectedIngredients = 0;

    if (this.state.currentPhase > this.config.totalDishes) {
      this.gameEnd();
      return;
    }

    // 顯示料理提示
    this.elements.hintContainer.style.display = "flex";
    this.elements[`hint${this.state.currentPhase}`].style.display = "block";
    this.elements.qText.src = `./assets/images/game/hints/${this.state.currentPhase}.png`;
    this.elements.qImg.src = `./assets/images/game/dishes/${this.state.currentPhase}.png`;

    setTimeout(() => this.startLevel(), this.config.dishHintDuration);
  }

  startLevel() {
    this.elements.hintContainer.style.display = "none";
    this.elements[`hint${this.state.currentPhase}`].style.display = "none";
    this.timers.countdown = setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown() {
    this.state.time--;

    if (this.state.time === this.config.warningTime) {
      this.elements.countdown.style.color = "red";
    }

    if (this.state.time <= 0) {
      this.finishDish();
      return;
    }

    this.elements.countdown.innerHTML = `<b>${this.state.time}</b>`;
  }

  addIngredient(foodId) {
    if (this.state.selectedIngredients >= this.config.maxIngredients) return;

    const box = document.createElement("div");
    box.className = "box ing food" + foodId;
    box.style.backgroundImage = `url('./assets/images/game/ingredients/${foodId}.png')`;

    const removeBtn = document.createElement("button");
    removeBtn.addEventListener("click", () => {
      box.remove();
      this.state.selectedIngredients--;
    });

    box.appendChild(removeBtn);
    document.querySelector(".container2").appendChild(box);
    this.state.selectedIngredients++;
  }

  finishDish() {
    this.state.time = this.config.startingTime;
    clearInterval(this.timers.countdown);
    this.elements.countdown.style.color = "#F07B7C";
    this.elements.countdown.innerHTML = "<b>45</b>";

    this.checkDish(this.state.currentPhase);
    this.state.currentPhase++;

    if (this.state.currentPhase <= this.config.totalDishes) {
      setTimeout(() => this.setLevel(), 1000);
    }
  }

  checkDish(dishId) {
    const recipe = this.recipes[dishId];
    const selectedIngredients = document.querySelectorAll(".ing");
    let isCorrect = true;

    // 檢查配方
    if (recipe == undefined) {
      this.gameEnd();
    }

    recipe.forEach((ingredientId) => {
      const ingredient = document.querySelector(`.food${ingredientId}`);
      if (ingredient) {
        this.markIngredient(ingredient, "O");
      } else {
        isCorrect = false;
      }
    });

    // 標記錯誤食材
    selectedIngredients.forEach((ing) => {
      if (ing.childElementCount === 1) {
        this.markIngredient(ing, "X");
        this.state.scoreDump++;
      }
    });

    // 更新分數
    if (isCorrect) {
      this.state.score++;
      this.elements[`Q${dishId}check`].style.display = "block";
      this.playSound("correct");
    } else {
      this.playSound("wrong");
    }
  }

  markIngredient(element, mark) {
    const markEl = document.createElement("b");
    markEl.className = "animate__animated animate__bounceIn result-mark";
    markEl.textContent = mark;
    element.appendChild(markEl);
  }

  clearIngredientBoxes() {
    document.querySelectorAll(".ing").forEach((box) => box.remove());
  }

  playSound(type) {
    const sound = new Audio(
      `./assets/sound/${type === "correct" ? "correct.mp3" : "wrong.wav"}`
    );
    sound.play().catch((e) => console.log("音效播放失敗:", e));
  }

  gameEnd() {
    clearInterval(this.timers.countdown);
    this.elements.result1.style.display = "flex";
    this.elements.scoreDump.textContent = this.state.scoreDump;
    this.elements.score.textContent = this.state.score;

    // 設定成績卡片
    const cardImg = this.cardImages[this.state.score] || this.cardImages[0];
    this.elements.card.src = `./assets/images/result/${cardImg}`;
  }

  showResult(resultNum) {
    if (resultNum === 2) {
      this.elements.result1.style.display = "none";
      this.elements.result2.style.display = "flex";
    } else if (resultNum === 3) {
      this.elements.bkMusic.pause();
      this.elements.result2.style.display = "none";
      this.elements.result3.style.display = "flex";
    }
  }

  finish() {
    if (window.playboard) {
      window.playboard.showNextButton();
    }
  }
}

// 初始化遊戲
window.addEventListener("DOMContentLoaded", () => {
  window.cookingGame = new CookingGame();
});
