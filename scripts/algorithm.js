// 根据艾宾浩斯规则计算下次复习日
function calculateNextReview(history) {
  // 如果没有历史记录，返回null
  if (history.length === 0) return null;
  
  // 获取最近一次记录
  const lastRecord = history[history.length - 1];
  const lastDate = new Date(lastRecord.date);
  
  // 获取连续正确次数
  let consecutiveCorrect = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].correct) {
      consecutiveCorrect++;
    } else {
      break;
    }
  }
  
  // 根据连续正确次数确定间隔天数
  const intervals = [1, 2, 3, 8];
  const days = consecutiveCorrect > intervals.length ? 
    intervals[intervals.length - 1] : 
    intervals[consecutiveCorrect - 1] || 0;
  
  // 计算下次复习日期
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().split('T')[0];
}

// 更新单词状态
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
    return;
  }
  
  // 计算连续正确次数
  const consecutiveCorrect = wordObj.history
    .filter(record => record.correct).length;
  
  // 根据连续正确次数更新状态
  if (consecutiveCorrect >= 5) {
    wordObj.status = WORD_STATUS.DONE;
    wordObj.nextReviewDay = null;
  } else {
    wordObj.status = WORD_STATUS.LEARNING;
    wordObj.nextReviewDay = calculateNextReview(wordObj.history);
  }
}

// 获取今天需要学习的单词
function getTodayWords() {
  const allWords = getAllWords();
  const today = getToday();
  
  // 1. 错词（最近2天错的）
  const wrongWords = allWords.filter(word => {
    // 只考虑状态为"新"的单词（错词重置后的状态）
    if (word.status !== WORD_STATUS.NEW) return false;
    
    // 检查最近2天内是否有错误记录
    const recentWrong = word.history.some(record => {
      if (!record.correct) {
        const recordDate = new Date(record.date);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - recordDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 2;
      }
      return false;
    });
    
    return recentWrong;
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
  
  // 按优先级合并：错词 > 到期复习词 > 新词
  const todayWords = [
    ...wrongWords,
    ...dueWords,
    ...newWords
  ];
  
  // 只取前8个
  return todayWords.slice(0, 8);
}
