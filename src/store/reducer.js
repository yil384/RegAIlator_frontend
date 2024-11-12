import { combineReducers } from 'redux';

// reducer import
import customizationReducer from './customizationReducer';
import authReducer from '../views/authentication/session/auth.reducer';
import usersReducer from '../views/users/users.reducer';
import viewerReducer from '../views/video-viewer/videoRender.reducer';
import videoGroupsReducer from '../views/video-group/video-groups.reducer';
import emailReducer from '../utils/emailReducer';

//-----------------------|| COMBINE REDUCER ||-----------------------//

const createRootReducer = () => combineReducers({
    authReducer,
    usersReducer,
    viewerReducer,
    videoGroupsReducer,
    emailReducer,
    customization: customizationReducer
});

export default createRootReducer;
