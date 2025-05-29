// scripts/index.js

window.onload = function() {
  // 确保数据初始化
  if (typeof initWordStorage === 'function') {
    initWordStorage();
  }
  
  // 获取当日计划
  const todayWords = getDailyPlan();
  const allWords = getAllWords();
  
  // 显示当前日期
  const now = new Date();
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('zh-CN', options);
  }
  
  // 显示今日单词
  const wordListEl = document.getElementById('today-words-list');
  if (wordListEl) {
    wordListEl.innerHTML = todayWords.map(wordObj => `
      <li>
        <span class="word">${wordObj.word}</span>
        <span class="status">${getStatusText(wordObj.status)}</span>
      </li>
    `).join('');
  }
  
  // 计算统计数据
  const stats = {
    total: allWords.length,
    learning: allWords.filter(w => w.status === WORD_STATUS.LEARNING).length,
    done: allWords.filter(w => w.status === WORD_STATUS.DONE).length,
    new: allWords.filter(w => w.status === WORD_STATUS.NEW).length
  };
  
  // 更新统计面板
  const totalEl = document.getElementById('total-words');
  const learningEl = document.getElementById('learning-words');
  const doneEl = document.getElementById('done-words');
  const todayCountEl = document.getElementById('today-task-count');
  
  if (totalEl) totalEl.textContent = stats.total;
  if (learningEl) learningEl.textContent = stats.learning;
  if (doneEl) doneEl.textContent = stats.done;
  if (todayCountEl) todayCountEl.textContent = todayWords.length;
  
  // 显示图表
  const ctx = document.getElementById('progress-chart');
  if (ctx) {
    const chartCtx = ctx.getContext('2d');
    
    // 计算图表数据
    const learningCount = stats.learning;
    const doneCount = stats.done;
    const newCount = stats.new;
    
    new Chart(chartCtx, {
      type: 'pie',
      data: {
        labels: ["已完成", "记忆中", "待学习"],
        datasets: [{
          data: [doneCount, learningCount, newCount],
          backgroundColor: ['#4CAF50', '#FF9800', '#9E9E9E']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // 进入听写模式按钮
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      // 存储今日词单用于听写页
      localStorage.setItem('dailyWords', JSON.stringify(todayWords));
      window.location.href = 'listen.html';
    });
  }
};

// 辅助函数：获取状态文本
function getStatusText(status) {
  const statusMap = {
    'new': '新词',
    'learning': '记忆中',
    'done': '已完成'
  };
  return statusMap[status] || status;
}
