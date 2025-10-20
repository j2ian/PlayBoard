/**
 * 食物分享遊戲主程式
 */
class FoodSharingGame {
  constructor() {
    // 遊戲設定
    this.config = {
      startingTime: 60,
      dumpTime: 15,
      hintDuration: 1000,
      phase1Interval: 5000,
      phase2Interval: 5000,
      phase3Interval: 5000,
      phase1Threshold: 60,
      phase2Threshold: 30,
      audioVolume: 0.2,
      maxScore: 100,
    };

    // 遊戲狀態
    this.state = {
      score: 0,
      scoreDump: 0,
      time: this.config.startingTime,
      tileAvailable: [true, true, true, true, true],
      dumpTimer: [-1, -1, -1, -1, -1],
    };

    // DOM 元素
    this.elements = {
      intro: null,
      hintArea: null,
      game: null,
      result: null,
      result2: null,
      result3: null,
      result4: null,
      hint: null,
      countdown: null,
      scoreDump: null,
      score: null,
      bkMusic: null,
      audioIntro: null,
      nextButton: null,
      finishStage: null,
    };

    // 計時器引用
    this.timers = {
      countdown: null,
      phase1: null,
      phase2: null,
      phase3: null,
    };

    // YouTube 播放器
    this.ytPlayer = null;

    this.init();
  }

  /**
   * 初始化遊戲
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.loadYouTubeAPI();

    // 新增音頻狀態檢查按鈕（除錯用）
    //this.addDebugButton();

    this.playAudio();
  }

  /**
   * 新增除錯按鈕來檢查音頻狀態
   */
  addDebugButton() {
    const debugBtn = document.createElement("button");
    debugBtn.textContent = "檢查音頻狀態";
    debugBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      z-index: 10000;
      font-family: 'jf-openhuninn';
    `;
    debugBtn.addEventListener("click", () => this.checkAudioStatus());
    document.body.appendChild(debugBtn);
  }

  /**
   * 檢查音頻狀態
   */
  checkAudioStatus() {
    console.log("=== 音頻狀態檢查 ===");
    console.log("背景音樂 (bkMusic):");
    console.log("  - src:", this.elements.bkMusic.src);
    console.log("  - 當前時間:", this.elements.bkMusic.currentTime);
    console.log("  - 持續時間:", this.elements.bkMusic.duration);
    console.log("  - 是否暫停:", this.elements.bkMusic.paused);
    console.log("  - 是否循環:", this.elements.bkMusic.loop);
    console.log("  - 音量:", this.elements.bkMusic.volume);
    console.log("  - 靜音:", this.elements.bkMusic.muted);
    console.log("  - 網路狀態:", this.elements.bkMusic.networkState);
    console.log("  - 準備狀態:", this.elements.bkMusic.readyState);

    console.log("\n介紹音頻 (audioIntro):");
    console.log("  - src:", this.elements.audioIntro.src);
    console.log("  - 當前時間:", this.elements.audioIntro.currentTime);
    console.log("  - 持續時間:", this.elements.audioIntro.duration);
    console.log("  - 是否暫停:", this.elements.audioIntro.paused);
    console.log("  - 是否循環:", this.elements.audioIntro.loop);
    console.log("  - 音量:", this.elements.audioIntro.volume);
    console.log("  - 靜音:", this.elements.audioIntro.muted);
    console.log("  - 網路狀態:", this.elements.audioIntro.networkState);
    console.log("  - 準備狀態:", this.elements.audioIntro.readyState);
    console.log("==================");
  }

  /**
   * 快取 DOM 元素
   */
  cacheElements() {
    this.elements.intro = document.getElementById("intro");
    this.elements.hintArea = document.getElementById("hintArea");
    this.elements.game = document.getElementById("game");
    this.elements.result = document.getElementById("result");
    this.elements.result2 = document.getElementById("result2");
    this.elements.result3 = document.getElementById("result3");
    this.elements.result4 = document.getElementById("result4");
    this.elements.hint = document.getElementById("hint");
    this.elements.countdown = document.getElementById("countdown");
    this.elements.scoreDump = document.getElementById("scoreDump");
    this.elements.score = document.getElementById("score");
    this.elements.bkMusic = document.getElementById("bkMusic");
    this.elements.audioIntro = document.getElementById("audio_intro");
    this.elements.nextButton = document.getElementById("nextButton");
    this.elements.finishStage = document.getElementById("finish_stage");
  }

  /**
   * 設定事件監聽器
   */
  setupEventListeners() {
    // 開始按鈕
    const startButtons = this.elements.intro.querySelectorAll(".button");
    startButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.startGame());
    });

    const setGameButtons = this.elements.hintArea.querySelectorAll(".button");
    setGameButtons.forEach((btn) => {
      btn.addEventListener(
        "click",
        () => this.setGame(),
        this.config.hintDuration
      );
    });

    // 結果頁面按鈕
    const result1Buttons = this.elements.result.querySelectorAll(".button");
    result1Buttons.forEach((btn) => {
      btn.addEventListener("click", () => this.showNextResult(1));
    });

    const result2Buttons = this.elements.result2.querySelectorAll(".button");
    result2Buttons.forEach((btn) => {
      btn.addEventListener("click", () => this.showNextResult(2));
    });

    const result3Buttons = this.elements.result3.querySelectorAll(".button");
    result3Buttons.forEach((btn) => {
      btn.addEventListener("click", () => this.showNextResult(3));
    });

    // 完成按鈕
    this.elements.finishStage.addEventListener("click", () => this.finish());

    // 設定拖放區域
    this.setupDropZones();
  }

  /**
   * 設定拖放區域
   */
  setupDropZones() {
    const dropZones = document.querySelectorAll(".boxReceive");
    dropZones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => this.allowDrop(e));
      zone.addEventListener("drop", (e) => this.drop(e));
    });
  }

  /**
   * 載入 YouTube API
   */
  loadYouTubeAPI() {
    const script = document.createElement("script");
    script.src = `https://www.youtube.com/iframe_api?v=${new Date().getTime()}`;
    document.head.appendChild(script);

    // 設定全域回調
    window.onYouTubeIframeAPIReady = () => this.onYouTubeIframeAPIReady();
  }

  /**
   * YouTube API 準備就緒
   */
  onYouTubeIframeAPIReady() {
    this.ytPlayer = new YT.Player("player", {
      videoId: "feL5TaU47iE",
      events: {
        onReady: (event) => this.onPlayerReady(event),
        onStateChange: (event) => this.onPlayerStateChange(event),
      },
    });
  }

  /**
   * YouTube 播放器準備就緒
   */
  onPlayerReady(event) {
    console.log("YouTube Player Ready", event);
  }

  /**
   * YouTube 播放器狀態變更
   */
  onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
      this.elements.finishStage.removeAttribute("hidden");
    }
  }

  /**
   * 播放音頻
   */
  playAudio() {
    // 設定背景音樂
    this.elements.bkMusic.loop = true;
    this.elements.bkMusic.volume = this.config.audioVolume;

    // 設定介紹音頻
    this.elements.audioIntro.loop = false;
    this.elements.audioIntro.volume = this.config.audioVolume;

    // 確保音頻已載入
    console.log("bkMusic src:", this.elements.bkMusic.src);
    console.log("audioIntro src:", this.elements.audioIntro.src);

    // 先播放背景音樂
    const bgMusicPromise = this.elements.bkMusic.play();

    if (bgMusicPromise !== undefined) {
      bgMusicPromise
        .then(() => {
          console.log("背景音樂播放成功");
          console.log("bkMusic 當前時間:", this.elements.bkMusic.currentTime);
          console.log("bkMusic 是否暫停:", this.elements.bkMusic.paused);
        })
        .catch((e) => {
          console.error("背景音樂播放失敗:", e);
        });
    }

    // 稍微延遲後播放介紹音頻，確保兩個音頻重疊
    setTimeout(() => {
      const introPromise = this.elements.audioIntro.play();

      if (introPromise !== undefined) {
        introPromise
          .then(() => {
            console.log("介紹音頻播放成功");
            console.log(
              "audioIntro 當前時間:",
              this.elements.audioIntro.currentTime
            );
            console.log(
              "audioIntro 是否暫停:",
              this.elements.audioIntro.paused
            );
          })
          .catch((e) => {
            console.error("介紹音頻播放失敗:", e);
          });
      }
    }, 100);
  }

  /**
   * 開始遊戲
   */
  startGame() {
    console.log("開始遊戲");
    this.elements.intro.style.display = "none";

    // 暫停介紹音頻
    this.elements.audioIntro.pause();
    console.log("介紹音頻已暫停");
    console.log("audioIntro 是否暫停:", this.elements.audioIntro.paused);

    // 確保背景音樂繼續播放
    console.log("bkMusic 是否暫停:", this.elements.bkMusic.paused);
    console.log("bkMusic 當前時間:", this.elements.bkMusic.currentTime);

    // 如果背景音樂意外暫停了，重新播放
    if (this.elements.bkMusic.paused) {
      console.log("背景音樂已暫停，重新播放");
      this.elements.bkMusic.play().catch((e) => {
        console.error("重新播放背景音樂失敗:", e);
      });
    }

    //setTimeout(() => this.setGame(), this.config.hintDuration);
  }

  /**
   * 設定遊戲
   */
  setGame() {
    this.elements.hintArea.style.display = "none";

    // 開始倒數計時
    this.timers.countdown = setInterval(() => this.updateCountdown(), 1000);

    // 開始第一階段
    this.generateGiveTiles(1);
    this.timers.phase1 = setInterval(
      () => this.generateGiveTiles(1),
      this.config.phase1Interval
    );
  }

  /**
   * 更新倒數計時
   */
  updateCountdown() {
    this.elements.countdown.innerHTML = `<b>${this.state.time}</b>`;
    this.state.time--;

    // 階段轉換
    if (this.state.time === this.config.phase1Threshold) {
      clearInterval(this.timers.phase1);
      this.timers.phase2 = setInterval(
        () => this.generateGiveTiles(2),
        this.config.phase2Interval
      );
    }

    if (this.state.time === this.config.phase2Threshold) {
      clearInterval(this.timers.phase2);
      this.timers.phase3 = setInterval(
        () => this.generateGiveTiles(3),
        this.config.phase3Interval
      );
    }

    if (this.state.time < 0) {
      clearInterval(this.timers.phase3);
      this.gameEnd();
      return;
    }

    // 更新垃圾桶計時器
    for (let i = 0; i < 5; i++) {
      if (this.state.dumpTimer[i] > -1) {
        this.state.dumpTimer[i]--;
      }
      if (this.state.dumpTimer[i] === 0) {
        setTimeout(() => this.dump(i), 1000);
      }
    }
  }

  /**
   * 生成食物方塊
   */
  generateGiveTiles(amount) {
    const hasAvailableTile = this.state.tileAvailable.some(
      (available) => available
    );

    if (!hasAvailableTile) return;

    for (let i = 0; i < amount; i++) {
      let randomIndex = Math.floor(Math.random() * 5);

      // 找到可用的格子
      if (!this.state.tileAvailable[randomIndex]) {
        randomIndex = Math.floor(Math.random() * 5);
      }

      setTimeout(
        () => this.setDraggableTile(randomIndex + 1),
        Math.floor(Math.random() * 5) * 1000
      );
      this.state.tileAvailable[randomIndex] = false;
    }
  }

  /**
   * 設定可拖曳的方塊
   */
  setDraggableTile(n) {
    const giveBox = document.getElementById(`give${n}`);
    if (giveBox.hasChildNodes()) return;

    this.state.dumpTimer[n - 1] = this.config.dumpTime;

    // 建立可拖曳的食物圖片
    const tile = document.createElement("img");
    tile.classList.add("draggable");
    tile.classList.add(n < 3 ? "type1" : "type2");
    tile.src = `./assets/images/game/shop/shop${n}.png`;
    tile.id = `drag${n}`;
    tile.value = n;
    tile.draggable = true;
    tile.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text", event.target.id);
    });

    // 建立光環背景
    const halo = document.createElement("img");
    halo.className = "dragbackground";
    halo.src = `./assets/images/game/halos/halo${n}.png`;

    // 建立垃圾桶圖片
    const dumpImg = document.createElement("img");
    dumpImg.className = "dragDump";
    dumpImg.src = `./assets/images/game/dump/dump${n}.png`;

    giveBox.appendChild(tile);
    giveBox.appendChild(halo);
    giveBox.appendChild(dumpImg);
  }

  /**
   * 允許拖放
   */
  allowDrop(event) {
    event.preventDefault();
  }

  /**
   * 處理拖放
   */
  drop(event) {
    event.preventDefault();

    const data = event.dataTransfer.getData("text");
    const draggableElement = document.getElementById(data);
    const dropzone = event.target.closest(".boxReceive");

    if (!dropzone || dropzone.childElementCount >= 1) return;

    const dropzoneType = dropzone.id.split("-")[0];
    const isType1 = draggableElement.classList.contains("type1");
    const isType2 = draggableElement.classList.contains("type2");

    // 檢查是否為正確的配對
    if (
      (dropzoneType === "share" && isType1) ||
      (dropzoneType === "box" && isType2)
    ) {
      draggableElement.src = `./assets/images/game/share/share${draggableElement.value}.png`;
      dropzone.appendChild(draggableElement);

      setTimeout(() => this.detectDropTile(dropzone.id), 1000);

      // 標記為可用
      const dragId = parseInt(data.replace("drag", ""));
      this.state.tileAvailable[dragId - 1] = true;
    }
  }

  /**
   * 偵測放置的方塊
   */
  detectDropTile(dropzoneId) {
    const dropzone = document.getElementById(dropzoneId);
    if (!dropzone.hasChildNodes()) return;

    const tileValue = dropzone.children[0].value;
    const giveBox = document.getElementById(`give${tileValue}`);

    // 清空原始位置
    while (giveBox.hasChildNodes()) {
      giveBox.removeChild(giveBox.firstChild);
    }

    // 播放音效
    const sfx = new Audio("./assets/sound/correct.mp3");
    sfx.play().catch((e) => console.log("音效播放失敗:", e));

    // 新增分數
    this.state.score++;

    // 移除放置的圖片
    dropzone.children[0].remove();

    // 延遲刪除分享圖片
    setTimeout(() => this.deleteShare(dropzoneId), 1000);
  }

  /**
   * 刪除分享圖片
   */
  deleteShare(dropzoneId) {
    const dropzone = document.getElementById(dropzoneId);
    if (dropzone.children.length >= 2) {
      dropzone.children[1].remove();
      dropzone.children[0].remove();
    }
  }

  /**
   * 丟棄食物
   */
  dump(index) {
    this.state.tileAvailable[index] = true;
    const giveBox = document.getElementById(`give${index + 1}`);

    if (giveBox.hasChildNodes()) {
      if (giveBox.firstChild.classList.contains("draggable")) {
        this.state.scoreDump++;
      }
    }

    while (giveBox.hasChildNodes()) {
      giveBox.removeChild(giveBox.firstChild);
    }
  }

  /**
   * 遊戲結束
   */
  gameEnd() {
    this.elements.bkMusic.volume = this.config.audioVolume;
    clearInterval(this.timers.countdown);

    this.elements.result.style.display = "flex";
    this.elements.scoreDump.innerText = this.state.scoreDump.toString();
    this.elements.score.innerText = this.state.score.toString();
  }

  /**
   * 顯示下一個結果頁面
   */
  showNextResult(current) {
    this.elements.bkMusic.pause();

    if (current === 1) {
      this.elements.result2.style.display = "flex";
    } else if (current === 2) {
      this.elements.result3.style.display = "flex";
    } else if (current === 3) {
      this.elements.result4.style.display = "flex";
    }
  }

  /**
   * 完成遊戲
   */
  finish() {
    if (window.playboard) {
      window.playboard.showNextButton();
    }
  }
}

// 當頁面載入完成後初始化遊戲
window.addEventListener("DOMContentLoaded", () => {
  window.foodSharingGame = new FoodSharingGame();
});
