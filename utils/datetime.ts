import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export const formatUnixDate = (
  unixDate: number,
  hourOffset?: number,
): string => {
  const dayjs = useDayjs();
  return dayjs
    .unix(unixDate)
    .add(hourOffset || 0, "hour")
    .format("YYYY-MM-DD HH:mm:ss Z");
};


export const formatDatetime = (dateRaw: number): string => {
  const dayjs = useDayjs();
  dayjs.extend(utc);
  dayjs.extend(timezone);
  return dayjs.utc(dateRaw).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
};