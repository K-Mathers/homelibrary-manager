import React from 'react';

export const ReadingJournalPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#24242b]">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-medium text-[#f2f0eb]">Читательский дневник</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#16161a] border border-[#24242b] text-[#9e9ba5]">
            Сессии и цитаты
          </span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-[#67646e]">
        Дневник чтения
      </div>
    </div>
  );
};

