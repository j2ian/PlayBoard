// PlayBoard 進度控制腳本
class PlayBoardProgress {
    constructor() {
        this.isCompleted = false;
        this.startTime = Date.now();
        this.setupNextButton();
    }
    
    setupNextButton() {
        const nextBtn = document.getElementById('nextButton');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.completePage();
            });
        }
    }
    
    showNextButton() {
        const nextBtn = document.getElementById('nextButton');
        if (nextBtn) {
            nextBtn.style.display = 'block';
        }
    }
    
    completePage(score = 100, customData = {}) {
        if (this.isCompleted) return;
        
        this.isCompleted = true;
        const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
        
        const progressData = {
            completed: true,
            score: score,
            timeSpent: timeSpent,
            attempts: 1,
            customData: customData
        };
        
        window.parent.postMessage({
            type: 'CUSTOM_PAGE_PROGRESS',
            action: 'complete',
            data: progressData
        }, '*');
    }
}

// 測驗邏輯
class SimpleQuiz {
    constructor() {
        // 測驗題目資料
        this.questions = [
            {
                question: "PlayBoard 是什麼類型的系統？",
                options: [
                    "學習管理系統 (LMS)",
                    "遊戲平台",
                    "社交媒體平台",
                    "電子商務網站"
                ],
                correct: 0,
                explanation: "PlayBoard 是一個學習管理系統，專為創建互動式學習內容而設計。"
            },
            {
                question: "PlayBoard 支援哪些內容類型？",
                options: [
                    "只有文字內容",
                    "文字、測驗、問卷、客製化頁面",
                    "只有視頻內容",
                    "只有圖片內容"
                ],
                correct: 1,
                explanation: "PlayBoard 支援多種內容類型，包括文字、測驗、問卷和客製化頁面。"
            },
            {
                question: "客製化頁面的主要入口檔案是什麼？",
                options: [
                    "main.html",
                    "index.html",
                    "page.html",
                    "content.html"
                ],
                correct: 1,
                explanation: "客製化頁面的主要入口檔案必須命名為 index.html。"
            }
        ];
        
        // 測驗狀態
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
        this.userAnswers = [];
        this.isCompleted = false;
        
        // 初始化測驗
        this.init();
    }
    
    /**
     * 初始化測驗
     */
    init() {
        console.log('初始化測驗...');
        this.setupEventListeners();
        this.updateQuestionCounter();
        this.showQuestion();
        this.updateProgress();
    }
    
    /**
     * 設定事件監聽器
     */
    setupEventListeners() {
        // 監聽選項點擊事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('option') && !e.target.disabled) {
                this.handleAnswer(e.target);
            }
            
            // 監聽完成按鈕點擊
            if (e.target.id === 'completeBtn') {
                this.completeQuiz();
            }
        });
        
        // 監聽鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '4' && !this.isCompleted) {
                const optionIndex = parseInt(e.key) - 1;
                const options = document.querySelectorAll('.option');
                if (options[optionIndex] && !options[optionIndex].disabled) {
                    this.handleAnswer(options[optionIndex]);
                }
            }
        });
    }
    
    /**
     * 顯示當前問題
     */
    showQuestion() {
        const question = this.questions[this.currentQuestion];
        const questionEl = document.getElementById('questionText');
        const optionsEl = document.getElementById('options');
        
        // 更新問題文字
        questionEl.textContent = question.question;
        
        // 生成選項
        optionsEl.innerHTML = question.options.map((option, index) => 
            `<button class="option" data-index="${index}">
                ${String.fromCharCode(65 + index)}. ${option}
            </button>`
        ).join('');
        
        // 更新提示
        this.updateHint(`按鍵盤 1-4 或點擊選項來回答問題`);
    }
    
    /**
     * 處理用戶回答
     */
    handleAnswer(selectedElement) {
        if (this.isCompleted) return;
        
        const selectedIndex = parseInt(selectedElement.dataset.index);
        const question = this.questions[this.currentQuestion];
        const isCorrect = selectedIndex === question.correct;
        
        // 記錄用戶答案
        this.userAnswers.push({
            questionIndex: this.currentQuestion,
            selectedIndex: selectedIndex,
            isCorrect: isCorrect,
            timeSpent: Date.now() - this.startTime
        });
        
        // 禁用所有選項
        const options = document.querySelectorAll('.option');
        options.forEach(option => option.disabled = true);
        
        // 標記選中的選項
        selectedElement.classList.add('selected');
        
        // 標記正確答案
        options[question.correct].classList.add('correct');
        
        // 如果答錯了，標記錯誤答案
        if (!isCorrect) {
            selectedElement.classList.add('incorrect');
        } else {
            this.correctAnswers++;
            this.score += Math.round(100 / this.questions.length);
        }
        
        // 更新提示
        this.updateHint(isCorrect ? 
            `✅ 正確！${question.explanation}` : 
            `❌ 錯誤。正確答案是：${question.options[question.correct]}`
        );
        
        // 延遲後進入下一題或顯示結果
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    /**
     * 進入下一題或顯示結果
     */
    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.questions.length) {
            this.updateQuestionCounter();
            this.updateProgress();
            this.showQuestion();
        } else {
            this.showResult();
        }
    }
    
    /**
     * 顯示測驗結果
     */
    showResult() {
        this.isCompleted = true;
        
        // 隱藏問題區域
        document.getElementById('question').style.display = 'none';
        
        // 顯示結果區域
        const resultEl = document.getElementById('result');
        resultEl.style.display = 'block';
        
        // 更新結果數據
        const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('correctAnswers').textContent = this.correctAnswers;
        document.getElementById('totalAnswers').textContent = this.questions.length;
        document.getElementById('timeSpent').textContent = timeSpent;
        
        // 更新進度條到 100%
        this.updateProgress(100);
        
        // 更新提示
        this.updateHint('🎉 測驗完成！點擊「完成測驗」按鈕繼續學習');
        
        console.log('測驗完成', {
            score: this.score,
            correctAnswers: this.correctAnswers,
            totalQuestions: this.questions.length,
            timeSpent: timeSpent,
            userAnswers: this.userAnswers
        });
    }
    
    /**
     * 完成測驗並發送結果
     */
    completeQuiz() {
        const customData = {
            questionsAnswered: this.questions.length,
            correctAnswers: this.correctAnswers,
            accuracy: Math.round((this.correctAnswers / this.questions.length) * 100)
        };
        
        window.playboard.completePage(this.score, customData);
        
        const nextBtn = document.getElementById('nextButton');
        nextBtn.textContent = '已提交';
        nextBtn.disabled = true;
    }
    
    /**
     * 更新問題計數器
     */
    updateQuestionCounter() {
        document.getElementById('currentQuestion').textContent = this.currentQuestion + 1;
        document.getElementById('totalQuestions').textContent = this.questions.length;
    }
    
    /**
     * 更新進度條
     */
    updateProgress(percentage = null) {
        const progressFill = document.getElementById('progressFill');
        const progress = percentage !== null ? 
            percentage : 
            Math.round(((this.currentQuestion + 1) / this.questions.length) * 100);
        
        progressFill.style.width = `${progress}%`;
    }
    
    /**
     * 更新提示訊息
     */
    updateHint(message) {
        const hintEl = document.getElementById('hint');
        hintEl.textContent = message;
    }
    
    /**
     * 獲取測驗統計
     */
    getStats() {
        return {
            score: this.score,
            correctAnswers: this.correctAnswers,
            totalQuestions: this.questions.length,
            timeSpent: Math.round((Date.now() - this.startTime) / 1000),
            isCompleted: this.isCompleted
        };
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.playboard = new PlayBoardProgress();
    window.quiz = new SimpleQuiz();
});

// 錯誤處理
window.addEventListener('error', (event) => {
    console.error('頁面錯誤:', event.error);
});
