import moment from "moment";

export const getGreetingTime = () => {

    const currentTime = moment();

    const splitAfternoon = 12; // 24hr time to split the afternoon
    const splitEvening = 17; // 24hr time to split the evening
    const currentHour = parseFloat(currentTime.format('HH'));

    if (currentHour >= splitAfternoon && currentHour <= splitEvening) {
        // Between 12 PM and 5PM
        return 'Good afternoon';
    } else if (currentHour >= splitEvening) {
        // Between 5PM and Midnight
        return 'Good evening';
    }
    // Between dawn and noon
    return 'Good morning';
};
