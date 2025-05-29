let currentIndex = 0;
let wrongWords = []; // 本次听写中错误的单词
let dailyWords = []; // 今日要听写的单词列表
let currentWordObj = null; // 当前单词对象

// 初始化听写页面
function initListenPage() {
  // 从首页获取今日单词
  const storedWords = localStorage.getItem('dailyWords');
  if (storedWords) {
    dailyWords = JSON.parse(storedWords);
    if (dailyWords.length > 0) {
      currentWordObj = dailyWords[0];
      playCurrentWord();
    } else {
      alert('今日没有单词需要学习！');
      window.location.href = 'index.html';
    }
  } else {
    alert('请从首页开始学习！');
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
  
  // 更新单词状态（核心记忆曲线逻辑）
  updateWordStatus(currentWordObj, isCorrect);
  
  // 处理反馈
  if (isCorrect) {
    feedbackEl.textContent = '✅ 正确';
    feedbackEl.style.color = '#4CAF50';
  } else {
    feedbackEl.textContent = `❌ 错误，正确拼写是：${currentWordObj.word}`;
    feedbackEl.style.color = '#F44336';
    
    // 添加到错词列表（避免重复）
    if (!wrongWords.some(w => w.word === currentWordObj.word)) {
      wrongWords.push({...currentWordObj});
    }
  }
  
  // 保存单词状态
  saveWordStatus(currentWordObj);
  
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

// 保存单词状态
function saveWordStatus(wordObj) {
  const allWords = getAllWords();
  const index = allWords.findIndex(w => w.word === wordObj.word);
  
  if (index !== -1) {
    allWords[index] = wordObj;
  } else {
    allWords.push(wordObj);
  }
  
  saveAllWords(allWords);
}

// 完成当日测试
function finishDailyTest() {
  const container = document.querySelector('body');
  container.innerHTML = `
    <div class="result-container">
      <h1>今日听写完成！</h1>
      
      ${wrongWords.length > 0 ? `
        <div class="wrong-section">
          <h2>需要复习的单词 (${wrongWords.length})</h2>
          <ul id="wrong-list">
            ${wrongWords.map(word => `<li>${word.word}</li>`).join('')}
          </ul>
          <button id="retry-btn" class="primary-btn">重新练习错词</button>
        </div>
      ` : `
        <div class="success-message">
          <p>🎉 太棒了！全部正确！</p>
          <button id="home-btn" class="primary-btn">返回首页</button>
        </div>
      `}
    </div>
  `;
  
  // 添加事件监听
  if (wrongWords.length > 0) {
    document.getElementById('retry-btn').addEventListener('click', function() {
      // 用错词作为新的练习列表
      dailyWords = [...wrongWords];
      wrongWords = [];
      currentIndex = 0;
      currentWordObj = dailyWords[0];
      
      // 重置页面
      document.querySelector('body').innerHTML = `
        <header>
          <h1>听写模式 - 错词练习</h1>
          <p>点击🔊播放单词，听写输入：</p>
        </header>
        
        <main class="listen-container">
          <div class="input-area">
            <button id="play-btn" class="icon-btn">🔊 播放</button>
            <input type="text" id="user-input" placeholder="请输入单词" autocomplete="off">
            <button id="submit-btn" class="primary-btn">提交</button>
          </div>
          
          <p id="feedback" class="feedback"></p>
        </main>
        
        <script src="scripts/app.js"></script>
        <script src="scripts/words.js"></script>
        <script src="scripts/algorithm.js"></script>
        <script src="scripts/listen.js"></script>
      `;
      
      // 重新初始化
      initListenPage();
      document.getElementById('play-btn').onclick = playCurrentWord;
      document.getElementById('submit-btn').onclick = submitAnswer;
      
      // 支持回车提交
      document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') submitAnswer();
      });
    });
  } else {
    document.getElementById('home-btn').addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  }
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
