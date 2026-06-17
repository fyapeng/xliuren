const animals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const dayNames = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
const monthMap = {'正月':1,'二月':2,'三月':3,'四月':4,'五月':5,'六月':6,'七月':7,'八月':8,'九月':9,'十月':10,'十一月':11,'十二月':12,'闰正月':1,'闰二月':2,'闰三月':3,'闰四月':4,'闰五月':5,'闰六月':6,'闰七月':7,'闰八月':8,'闰九月':9,'闰十月':10,'闰十一月':11,'闰十二月':12};

export const SHICHEN_NAMES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
export const SHICHEN_RANGES = ['23:00-01:00','01:00-03:00','03:00-05:00','05:00-07:00','07:00-09:00','09:00-11:00','11:00-13:00','13:00-15:00','15:00-17:00','17:00-19:00','19:00-21:00','21:00-23:00'];
export const SHICHEN_ELEMENTS = ['水','土','木','木','土','火','火','土','金','金','土','水'];

export function solarToLunar(date) {
  const parts = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).formatToParts(date);
  const yearName = parts.find(p => p.type === 'yearName')?.value || '';
  const monthStr = parts.find(p => p.type === 'month')?.value || '';
  const dayNum = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
  return {
    ganZhiYear: yearName,
    animal: animals[(date.getFullYear() - 4) % 12],
    lunarMonth: monthMap[monthStr] || 1,
    lunarDay: dayNum,
    isLeap: monthStr.startsWith('闰'),
    monthName: monthStr,
    dayName: dayNames[dayNum - 1] || `${dayNum}日`
  };
}

export function getShiChenIndex(hour) {
  return (hour === 23 || hour === 0) ? 0 : Math.floor((hour + 1) / 2);
}

export function formatCurrentTime(date = new Date()) {
  const lunar = solarToLunar(date);
  const scIdx = getShiChenIndex(date.getHours());
  const pad = n => String(n).padStart(2, '0');
  return {
    solar: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    lunar: `${lunar.ganZhiYear}年（${lunar.animal}） ${lunar.monthName}${lunar.dayName}`,
    shichen: `${SHICHEN_NAMES[scIdx]}时 (${SHICHEN_RANGES[scIdx]}) · 五行属${SHICHEN_ELEMENTS[scIdx]}`,
    lunarData: lunar,
    shichenIndex: scIdx
  };
}