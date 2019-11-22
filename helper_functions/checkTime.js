const checkTime = (startTime, endTime, timeBuffer) => {
  let valid = false;
  let color = '#50ba50';

  if (!startTime && !endTime) return [true, color];

  const timeInstance = new Date();
  const hours = timeInstance.getHours();
  const minutes = timeInstance.getMinutes();

  const currentTime = parseInt(`

    ${hours.toString().length > 1 && hours !== 0 ?
    hours
    : '0' + hours}

    ${minutes.toString().length > 1 ?
   minutes 
   : '0' + minutes}

   `, 10);


  valid = (currentTime > startTime && currentTime < endTime);
  if (valid) {
    if (Math.abs(endTime - currentTime) < timeBuffer) color = 'red';
  }

  return [valid, color];
};

export default checkTime;
