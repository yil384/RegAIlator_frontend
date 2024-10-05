import { useSelector } from 'react-redux'

const useUserNameSelector = () => {
    const sessionUser = useSelector((state) => state.authReducer.user)
    return sessionUser;
};

export default useUserNameSelector;
