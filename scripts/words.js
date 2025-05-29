// 单词状态常量
const WORD_STATUS = {
  NEW: 'new',
  LEARNING: 'learning',
  DONE: 'done'
};

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    [WORD_STATUS.NEW]: '新词',
    [WORD_STATUS.LEARNING]: '记忆中',
    [WORD_STATUS.DONE]: '已完成'
  };
  return statusMap[status] || status;
}
