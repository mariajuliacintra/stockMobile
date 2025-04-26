export const isDateToday = (date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };
  
  export const isBeforeNow = (date) => {
    return date < new Date();
  };
  
  export const getToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  };
  