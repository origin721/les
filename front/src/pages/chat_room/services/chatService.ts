// Chat Service with optimized messageByIdDate structure
// Structure: year > month > day > hour > minute > second > messageId

export type Message = {
  id: string;
  message: Array<{ type: 'text', content: string }>;
  timestamp?: number;
  sender?: string;
};

export type OptimizedMessageByIdDate = {
  [year: number]: {
    [month: number]: {
      [day: number]: {
        [hour: number]: {
          [minute: number]: {
            [second: number]: {
              [messageId: string]: Message;
            }
          }
        }
      }
    }
  }
};

export type ChatRoom = {
  id: string;
  sourceName: string;
  localName: string;
  myAccId: string;
  messageByIdDate: OptimizedMessageByIdDate;
};

/**
 * Добавляет сообщение в оптимизированную структуру данных
 */
export function addMessageToStructure(
  structure: OptimizedMessageByIdDate,
  message: Message
): OptimizedMessageByIdDate {
  if (!message.timestamp) {
    console.warn('Message without timestamp, using current time');
    message.timestamp = Date.now();
  }

  const date = new Date(message.timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11, we want 1-12
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  // Создаем структуру если она не существует
  if (!structure[year]) structure[year] = {};
  if (!structure[year][month]) structure[year][month] = {};
  if (!structure[year][month][day]) structure[year][month][day] = {};
  if (!structure[year][month][day][hour]) structure[year][month][day][hour] = {};
  if (!structure[year][month][day][hour][minute]) structure[year][month][day][hour][minute] = {};
  if (!structure[year][month][day][hour][minute][second]) structure[year][month][day][hour][minute][second] = {};

  // Добавляем сообщение
  structure[year][month][day][hour][minute][second][message.id] = message;

  return structure;
}

/**
 * Извлекает все сообщения из оптимизированной структуры данных
 */
export function extractMessages(room: ChatRoom): Message[] {
  const messages: Message[] = [];
  
  for (const year of Object.values(room.messageByIdDate)) {
    for (const month of Object.values(year)) {
      for (const day of Object.values(month)) {
        for (const hour of Object.values(day)) {
          for (const minute of Object.values(hour)) {
            for (const second of Object.values(minute)) {
              for (const message of Object.values(second)) {
                messages.push(message);
              }
            }
          }
        }
      }
    }
  }
  
  // Сортируем по времени
  return messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

/**
 * Извлекает сообщения за определенный временной диапазон
 */
export function extractMessagesByTimeRange(
  room: ChatRoom,
  startTimestamp: number,
  endTimestamp: number
): Message[] {
  const messages: Message[] = [];
  
  const startDate = new Date(startTimestamp);
  const endDate = new Date(endTimestamp);
  
  // Получаем временные границы
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  
  for (let year = startYear; year <= endYear; year++) {
    if (!room.messageByIdDate[year]) continue;
    
    const startMonth = year === startYear ? startDate.getMonth() + 1 : 1;
    const endMonth = year === endYear ? endDate.getMonth() + 1 : 12;
    
    for (let month = startMonth; month <= endMonth; month++) {
      if (!room.messageByIdDate[year][month]) continue;
      
      const startDay = (year === startYear && month === startMonth) ? startDate.getDate() : 1;
      const endDay = (year === endYear && month === endMonth) ? endDate.getDate() : 31;
      
      for (let day = startDay; day <= endDay; day++) {
        if (!room.messageByIdDate[year][month][day]) continue;
        
        for (const hour of Object.values(room.messageByIdDate[year][month][day])) {
          for (const minute of Object.values(hour)) {
            for (const second of Object.values(minute)) {
              for (const message of Object.values(second)) {
                if (message.timestamp && 
                    message.timestamp >= startTimestamp && 
                    message.timestamp <= endTimestamp) {
                  messages.push(message);
                }
              }
            }
          }
        }
      }
    }
  }
  
  return messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

/**
 * Извлекает сообщения за последние N минут
 */
export function extractRecentMessages(room: ChatRoom, minutesBack: number = 60): Message[] {
  const now = Date.now();
  const startTime = now - (minutesBack * 60 * 1000);
  
  return extractMessagesByTimeRange(room, startTime, now);
}

/**
 * Создает тестовые данные с новой структурой
 */
export function createTestChatRoom(roomId: string): ChatRoom {
  const room: ChatRoom = {
    id: roomId,
    sourceName: 'Тестовая комната',
    localName: `ROOM_${roomId}`,
    myAccId: 'user1',
    messageByIdDate: {}
  };

  // Создаем тестовые сообщения
  const testMessages: Message[] = [
    {
      id: 'msg1',
      message: [{ type: 'text', content: 'Добро пожаловать в защищенный канал!' }],
      timestamp: Date.now() - 3600000, // 1 час назад
      sender: 'system'
    },
    {
      id: 'msg2',
      message: [{ type: 'text', content: 'Соединение установлено' }],
      timestamp: Date.now() - 1800000, // 30 минут назад
      sender: 'system'
    },
    {
      id: 'msg3',
      message: [{ type: 'text', content: 'Привет! Как дела?' }],
      timestamp: Date.now() - 900000, // 15 минут назад
      sender: 'user2'
    },
    {
      id: 'msg4',
      message: [{ type: 'text', content: 'Отлично! Тестируем новую структуру данных' }],
      timestamp: Date.now() - 300000, // 5 минут назад
      sender: 'user1'
    },
    {
      id: 'msg5',
      message: [{ type: 'text', content: 'Структура с часами/минутами/секундами работает идеально!' }],
      timestamp: Date.now() - 60000, // 1 минута назад
      sender: 'user2'
    }
  ];

  // Добавляем все сообщения в структуру
  for (const message of testMessages) {
    addMessageToStructure(room.messageByIdDate, message);
  }

  return room;
}

/**
 * Получает статистику сообщений по времени
 */
export function getMessageStats(room: ChatRoom) {
  const stats = {
    totalMessages: 0,
    messagesByHour: {} as Record<string, number>,
    messagesByDay: {} as Record<string, number>,
    messagesBySender: {} as Record<string, number>
  };

  for (const [year, yearData] of Object.entries(room.messageByIdDate)) {
    for (const [month, monthData] of Object.entries(yearData)) {
      for (const [day, dayData] of Object.entries(monthData)) {
        const dayKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        for (const [hour, hourData] of Object.entries(dayData)) {
          const hourKey = `${dayKey} ${hour.padStart(2, '0')}:00`;
          
          for (const minute of Object.values(hourData)) {
            for (const second of Object.values(minute)) {
              for (const message of Object.values(second)) {
                stats.totalMessages++;
                
                // Статистика по часам
                stats.messagesByHour[hourKey] = (stats.messagesByHour[hourKey] || 0) + 1;
                
                // Статистика по дням
                stats.messagesByDay[dayKey] = (stats.messagesByDay[dayKey] || 0) + 1;
                
                // Статистика по отправителям
                const sender = message.sender || 'unknown';
                stats.messagesBySender[sender] = (stats.messagesBySender[sender] || 0) + 1;
              }
            }
          }
        }
      }
    }
  }

  return stats;
}

/**
 * Поиск сообщений по тексту
 */
export function searchMessages(room: ChatRoom, searchText: string): Message[] {
  const allMessages = extractMessages(room);
  const searchLower = searchText.toLowerCase();
  
  return allMessages.filter(message => {
    return message.message.some(part => 
      part.type === 'text' && 
      part.content.toLowerCase().includes(searchLower)
    );
  });
}

/**
 * Группирует сообщения по временным периодам
 */
export function groupMessagesByTime(messages: Message[], groupBy: 'hour' | 'day' | 'month' = 'day') {
  const groups: Record<string, Message[]> = {};
  
  for (const message of messages) {
    if (!message.timestamp) continue;
    
    const date = new Date(message.timestamp);
    let key: string;
    
    switch (groupBy) {
      case 'hour':
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:00`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      default: // day
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        break;
    }
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(message);
  }
  
  return groups;
}
