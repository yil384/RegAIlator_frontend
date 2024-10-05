import Cookies from 'js-cookie';

export const getExpiration = (minutes) =>
    (new Date(new Date().getTime() + 60 * minutes * 1000));

class cookieService {

    setCookie(cookieName, value) {
        Cookies.set(cookieName, value, { expires: getExpiration(60) });
    }

    getCookie(cookieName) {
        return Cookies.get(cookieName);
    }

    deleteCookie(cookieName) {
        Cookies.remove(cookieName);
    }

}

export default new cookieService();
