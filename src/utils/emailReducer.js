// reducers/emailReducer.js

const initialState = {
    emailUpdateCount: 0,
    // 其他状态
};

const emailReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'EMAIL_RECEIVED':
            return {
                ...state,
                emailUpdateCount: state.emailUpdateCount + 1,
            };
        // 其他 case
        default:
            return state;
    }
};

export default emailReducer;
