// 单词状态常量
const WORD_STATUS = {
  NEW: 'new',
  LEARNING: 'learning',
  DONE: 'done'
};

// 获取今天日期（格式：YYYY-MM-DD）
function getToday() {
  const now = new Date();
  return now.toISOString().split('T')[0];
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
    learning: words.filter(w => w.status === WORD_STATUS.LEARNING).length,
    done: words.filter(w => w.status === WORD_STATUS.DONE).length,
    lastUpdated: getToday()
  };
  localStorage.setItem('learnedStats', JSON.stringify(stats));
}

// 保存单个单词状态
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

// 辅助函数：判断日期是否在N天内
function isWithinDays(dateString, days) {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays <= days;
}

// 获取或创建当日单词计划
function getDailyPlan() {
  const today = getToday();
  const planKey = `dailyPlan_${today}`;
  
  // 如果当日计划已存在，直接返回
  const storedPlan = localStorage.getItem(planKey);
  if (storedPlan) {
    return JSON.parse(storedPlan);
  }
  
  // 生成新计划
  const todayWords = generateTodayWords();
  localStorage.setItem(planKey, JSON.stringify(todayWords));
  return todayWords;
}

// 生成当日单词（基于记忆曲线）
function generateTodayWords() {
  const allWords = getAllWords();
  const today = getToday();
  
  // 1. 错词（最近2天错的）
  const wrongWords = allWords.filter(word => {
    if (word.status !== WORD_STATUS.NEW) return false;
    return word.history.some(record => 
      !record.correct && isWithinDays(record.date, 2)
    );
  });
  
  // 2. 到期复习词
  const dueWords = allWords.filter(word => 
    word.status === WORD_STATUS.LEARNING && 
    word.nextReviewDay === today
  );
  
  // 3. 新词（从未学习过）
  const newWords = allWords.filter(word => 
    word.status === WORD_STATUS.NEW && 
    word.history.length === 0
  );
  
  // 按优先级合并
  return [...wrongWords, ...dueWords, ...newWords].slice(0, 8);
}

// 计算连续正确次数（从最新记录开始）
function getConsecutiveCorrectCount(history) {
  let count = 0;
  // 从最新记录开始反向检查
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].correct) {
      count++;
    } else {
      break; // 遇到错误就停止
    }
  }
  return count;
}

// 准确计算下次复习日（使用新间隔）
function calculateNextReview(history) {
  // 只考虑正确记录
  const correctRecords = history.filter(record => record.correct);
  
  if (correctRecords.length === 0) return null;
  
  // 按日期排序（从旧到新）
  correctRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // 新的艾宾浩斯间隔规则 [1, 2, 4, 7, 15]
  const intervals = [1, 2, 4, 7, 15];
  const intervalIndex = Math.min(correctRecords.length - 1, intervals.length - 1);
  const daysToAdd = intervals[intervalIndex];
  
  // 从最近正确日期开始计算
  const lastCorrectDate = new Date(correctRecords[correctRecords.length - 1].date);
  const nextDate = new Date(lastCorrectDate);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  
  return nextDate.toISOString().split('T')[0];
}

// 更新单词状态（修复记忆曲线计算）
function updateWordStatus(wordObj, isCorrect) {
  const today = getToday();
  
  // 添加历史记录
  wordObj.history.push({
    date: today,
    correct: isCorrect
  });
  
  // 错题处理（重置状态）
  if (!isCorrect) {
    wordObj.status = WORD_STATUS.NEW;
    wordObj.nextReviewDay = null;
    saveWordStatus(wordObj);
    return;
  }
  
  // 计算连续正确次数
  const consecutiveCorrect = getConsecutiveCorrectCount(wordObj.history);
  
  // 根据连续正确次数更新状态（5个阶段）
  if (consecutiveCorrect >= 5) {
    wordObj.status = WORD_STATUS.DONE;
    wordObj.nextReviewDay = null;
  } else {
    wordObj.status = WORD_STATUS.LEARNING;
    wordObj.nextReviewDay = calculateNextReview(wordObj.history);
  }
  
  saveWordStatus(wordObj);
}
