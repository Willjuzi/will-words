let currentIndex = 0;
let wrongWords = []; // 本次听写中错误的单词
let dailyWords = []; // 今日要听写的单词列表
let currentWordObj = null; // 当前单词对象
let practiceMode = 'first'; // 'first' | 'retry' | 'review'

// 初始化听写页面
function initListenPage() {
  // 检查练习模式
  const urlParams = new URLSearchParams(window.location.search);
  practiceMode = urlParams.get('mode') || 'first';
  
  // 根据模式加载单词
  if (practiceMode === 'retry') {
    // 错词练习模式：只加载上次出错的单词
    const lastWrongWords = JSON.parse(localStorage.getItem('lastWrongWords') || [];
    if (lastWrongWords.length > 0) {
      dailyWords = lastWrongWords;
      document.querySelector('h1').textContent = '错词练习';
    } else {
      alert('没有需要练习的错词！');
      window.location.href = 'index.html';
      return;
    }
  } else {
    // 其他模式：从首页获取今日单词
    const storedWords = localStorage.getItem('dailyWords');
    if (storedWords) {
      dailyWords = JSON.parse(storedWords);
      
      if (practiceMode === 'review') {
        document.querySelector('h1').textContent = '复习练习';
      }
    } else {
      alert('请从首页开始学习！');
      window.location.href = 'index.html';
      return;
    }
  }
  
  if (dailyWords.length > 0) {
    currentWordObj = dailyWords[0];
    playCurrentWord();
  } else {
    alert('今日没有单词需要学习！');
    window.location.href = 'index.html';
  }
}

// 播放当前单词
function playCurrentWord() {
  if (currentWordObj) {
    speak(currentWordObj.word);
  }
}

// 提交答案
function submitAnswer() {
  const inputEl = document.getElementById('user-input');
  const feedbackEl = document.getElementById('feedback');
  const userInput = inputEl.value.trim().toLowerCase();
  
  if (!currentWordObj) return;
  
  const isCorrect = userInput === currentWordObj.word.toLowerCase();
  
  // 更新单词状态
  updateWordStatus(currentWordObj, isCorrect);
  
  // 处理反馈
  if (isCorrect) {
    feedbackEl.textContent = '✅ 正确';
    feedbackEl.style.color = '#4CAF50';
    
    // 从错词列表中移除（如果存在）
    wrongWords = wrongWords.filter(w => w.word !== currentWordObj.word);
  } else {
    feedbackEl.textContent = `❌ 错误，正确拼写是：${currentWordObj.word}`;
    feedbackEl.style.color = '#F44336';
    
    // 添加到错词列表（避免重复）
    if (!wrongWords.some(w => w.word === currentWordObj.word)) {
      wrongWords.push({...currentWordObj});
    }
  }
  
  // 保存本次错词用于后续练习
  localStorage.setItem('lastWrongWords', JSON.stringify(wrongWords));
  
  // 延迟后处理下一个单词
  setTimeout(() => {
    currentIndex++;
    
    if (currentIndex < dailyWords.length) {
      currentWordObj = dailyWords[currentIndex];
      inputEl.value = '';
      feedbackEl.textContent = '';
      playCurrentWord();
    } else {
      finishDailyTest();
    }
  }, 1500); // 1.5秒后切换
}

// 完成当日测试
function finishDailyTest() {
  const container = document.querySelector('body');
  
  if (wrongWords.length > 0) {
    container.innerHTML = `
      <div class="result-container">
        <h1>${practiceMode === 'retry' ? '错词练习完成' : '今日听写完成'}！</h1>
        <div class="wrong-section">
          <h2>需要复习的单词 (${wrongWords.length})</h2>
          <ul id="wrong-list">
            ${wrongWords.map(word => `<li>${word.word}</li>`).join('')}
          </ul>
          <div class="action-buttons">
            <button id="retry-btn" class="primary-btn">只练错词</button>
            <button id="review-btn" class="secondary-btn">全部重练</button>
          </div>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="result-container">
        <h1>${practiceMode === 'retry' ? '错词练习完成' : '今日听写完成'}！</h1>
        <div class="success-message">
          <p>🎉 太棒了！全部正确！</p>
          <div class="action-buttons">
            <button id="review-btn" class="primary-btn">${practiceMode === 'retry' ? '再练一遍' : '重新练习'}</button>
            <button id="home-btn" class="secondary-btn">返回首页</button>
          </div>
        </div>
      </div>
    `;
  }
  
  // 绑定按钮事件
  if (wrongWords.length > 0) {
    document.getElementById('retry-btn').addEventListener('click', () => {
      startPracticeSession('retry');
    });
    
    document.getElementById('review-btn').addEventListener('click', () => {
      startPracticeSession('review');
    });
  } else {
    document.getElementById('review-btn').addEventListener('click', () => {
      startPracticeSession(practiceMode === 'retry' ? 'retry' : 'review');
    });
    
    document.getElementById('home-btn').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

// 开始练习会话
function startPracticeSession(mode) {
  // 保存错词用于错词练习模式
  if (mode === 'retry' && wrongWords.length > 0) {
    localStorage.setItem('lastWrongWords', JSON.stringify(wrongWords));
  }
  
  // 重定向到听写页并指定模式
  window.location.href = `listen.html?mode=${mode}`;
}

// 页面加载初始化
window.onload = function() {
  initListenPage();
  
  // 绑定按钮事件
  document.getElementById('play-btn').addEventListener('click', playCurrentWord);
  document.getElementById('submit-btn').addEventListener('click', submitAnswer);
  
  // 支持回车提交
  document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') submitAnswer();
  });
};
