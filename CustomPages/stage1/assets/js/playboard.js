/**
 * PlayBoard 進度控制類別
 */
class PlayBoardProgress {
    constructor() {
        this.isCompleted = false;
        this.startTime = Date.now();
        this.setupNextButton();
    }

    /**
     * 設定下一步按鈕
     */
    setupNextButton() {
        const nextBtn = document.getElementById('nextButton');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.completePage();
            });
        }
    }

    /**
     * 顯示下一步按鈕
     */
    showNextButton() {
        const nextBtn = document.getElementById('nextButton');
        if (nextBtn) {
            nextBtn.style.display = 'block';
        }
    }

    /**
     * 完成頁面
     */
    completePage(customScore = null, customData = {}) {
        if (this.isCompleted) return;

        this.isCompleted = true;
        const timeSpent = Math.round((Date.now() - this.startTime) / 1000);

        // 獲取遊戲分數
        const game = window.foodSharingGame;
        const finalScore = customScore !== null ? customScore : (game ? game.state.score : 0);
        const maxScore = 100;
        const scorePercentage = Math.min(100, Math.round((finalScore / maxScore) * 100));

        const progressData = {
            completed: true,
            score: scorePercentage,
            timeSpent: timeSpent,
            attempts: 1,
            customData: {
                ...customData,
                shareScore: game ? game.state.score : 0,
                dumpScore: game ? game.state.scoreDump : 0,
                totalItems: game ? (game.state.score + game.state.scoreDump) : 0
            }
        };

        // 發送完成訊息給 PlayBoard
        window.parent.postMessage({
            type: 'CUSTOM_PAGE_PROGRESS',
            action: 'complete',
            data: progressData
        }, '*');
    }

    /**
     * 更新進度（可選）
     */
    updateProgress(progress, customData = {}) {
        window.parent.postMessage({
            type: 'CUSTOM_PAGE_PROGRESS',
            action: 'update',
            data: {
                progress: progress,
                customData: customData
            }
        }, '*');
    }
}

// 自動初始化
window.addEventListener('DOMContentLoaded', () => {
    window.playboard = new PlayBoardProgress();
});
