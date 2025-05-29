window.onload = function() {
  // 获取今日单词
  const todayWords = getTodayWords();
  const allWords = getAllWords();
  const stats = getStats();
  
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
  
  // 更新统计信息
  document.getElementById('total-words').textContent = stats.total || allWords.length;
  document.getElementById('learning-words').textContent = stats.learning || 
    allWords.filter(w => w.status === WORD_STATUS.LEARNING).length;
  document.getElementById('done-words').textContent = stats.done || 
    allWords.filter(w => w.status === WORD_STATUS.DONE).length;
  document.getElementById('today-task-count').textContent = todayWords.length;
  
  // 显示图表
  const ctx = document.getElementById('progress-chart').getContext('2d');
  const learningCount = allWords.filter(w => w.status === WORD_STATUS.LEARNING).length;
  const doneCount = allWords.filter(w => w.status === WORD_STATUS.DONE).length;
  const newCount = allWords.length - learningCount - doneCount;
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['已完成', '记忆中', '未学习'],
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
