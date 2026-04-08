// reducers/emailReducer.js

const initialState = {
    emailUpdateCount: 0,
    // Other state
};

const emailReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'EMAIL_RECEIVED':
            return {
                ...state,
                emailUpdateCount: state.emailUpdateCount + 1,
            };
        // Other cases
        default:
            return state;
    }
};

export default emailReducer;
