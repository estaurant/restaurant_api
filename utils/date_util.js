'use strict';

const getTime = () => {
    let d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();
    return h + m/100;
}

const getDayOfWeek = () => {
    let days = ['sun','mon','tue','wed','thr','fri','sat'];
    let date = new Date();

    return days[date.getDay()];
}

module.exports = {
    getTime:getTime,
    getDayOfWeek:getDayOfWeek
}