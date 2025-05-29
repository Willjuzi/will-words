// 初始化单词存储
function initWordStorage() {
  if (!localStorage.getItem('wordStatusList')) {
    // 初始单词列表
    const initialWords = [
      "over", "new", "art", "take", "only", "car", "park", "hard", "barn", "card",
      "shark", "dark", "eyes", "date", "hold", "little", "work", "know", "place", "years",
      "rain", "mail", "wait", "paint", "chant", "paid", "sail", "goods", "services",
      "consumer", "producer", "live", "cool", "give", "most", "saw", "law", "raw", "jar",
      "straw", "draw", "country", "ocean", "title", "skip", "change", "very", "after",
      "things", "our", "just", "girl", "dirt", "shirt", "third", "thirst", "birth",
      "yellow", "add", "got", "life", "cycle", "pole", "wire", "fight", "seen", "eat",
      "right", "might", "sight", "tight", "flight", "bright", "lost", "far", "push", "pull",
      "resource", "say", "great", "four", "help", "through", "gold", "cold", "fold",
      "mold", "sold", "told", "subtract", "answer", "baby", "parent", "stages"
    ].map(word => ({
      word: word,
      status: "new", // new/learning/done
      history: [],   // 历史记录数组
      nextReviewDay: null // 下次复习日期
    }));

    // 保存到localStorage
    localStorage.setItem('wordStatusList', JSON.stringify(initialWords));
    
    // 初始化统计数据
    localStorage.setItem('learnedStats', JSON.stringify({
      total: initialWords.length,
      lastUpdated: new Date().toISOString().split('T')[0]
    }));
  }
}

// 获取所有单词
function getAllWords() {
  const stored = localStorage.getItem('wordStatusList');
  return stored ? JSON.parse(stored) : [];
}

// 保存所有单词
function saveAllWords(words) {
  localStorage.setItem('wordStatusList', JSON.stringify(words));
  
  // 更新统计数据
  const stats = {
    total: words.length,
    learning: words.filter(w => w.status === 'learning').length,
    done: words.filter(w => w.status === 'done').length,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  localStorage.setItem('learnedStats', JSON.stringify(stats));
}

// 获取统计数据
function getStats() {
  const stored = localStorage.getItem('learnedStats');
  return stored ? JSON.parse(stored) : {
    total: 0,
    learning: 0,
    done: 0,
    lastUpdated: null
  };
}

// 在页面加载时初始化
document.addEventListener('DOMContentLoaded', initWordStorage);

// 获取今天日期（格式：YYYY-MM-DD）
function getToday() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// 显示当前日期
function displayCurrentDate() {
  const now = new Date();
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  const dateStr = now.toLocaleDateString('zh-CN', options);
  
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = dateStr;
  }
}

// 语音播放函数
function speak(word) {
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(word);
    msg.lang = 'en-US';
    msg.rate = 0.9; // 稍慢速
    window.speechSynthesis.speak(msg);
  } else {
    console.error('您的浏览器不支持语音合成功能');
  }
}

// 初始化日期显示
displayCurrentDate();
