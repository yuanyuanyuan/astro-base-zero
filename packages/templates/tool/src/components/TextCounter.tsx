import React, { useState, useCallback } from 'react';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
}

const TextCounter: React.FC = () => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    lines: 0,
    paragraphs: 0,
  });

  const calculateStats = useCallback((inputText: string): TextStats => {
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;
    const lines = inputText === '' ? 0 : inputText.split('\n').length;
    const paragraphs = inputText.trim() === '' ? 0 : inputText.trim().split(/\n\s*\n/).length;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setStats(calculateStats(newText));
  };

  const clearText = () => {
    setText('');
    setStats({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
    });
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('文本已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const StatCard = ({ label, value, icon }: { label: string; value: number; icon: string }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div>
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
          输入文本
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={handleTextChange}
          placeholder="在此输入或粘贴您的文本..."
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={clearText}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          清空文本
        </button>
        <button
          onClick={copyText}
          disabled={!text}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          复制文本
        </button>
      </div>

      {/* 统计结果 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="字符数" value={stats.characters} icon="🔤" />
        <StatCard label="字符数（不含空格）" value={stats.charactersNoSpaces} icon="📝" />
        <StatCard label="单词数" value={stats.words} icon="📊" />
        <StatCard label="行数" value={stats.lines} icon="📋" />
        <StatCard label="段落数" value={stats.paragraphs} icon="📄" />
      </div>

      {/* 详细信息 */}
      {text && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">📈 详细分析</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• 平均每行字符数: {stats.lines > 0 ? Math.round(stats.characters / stats.lines) : 0}</p>
            <p>• 平均每段字符数: {stats.paragraphs > 0 ? Math.round(stats.characters / stats.paragraphs) : 0}</p>
            <p>• 平均单词长度: {stats.words > 0 ? Math.round(stats.charactersNoSpaces / stats.words) : 0} 字符</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextCounter; 