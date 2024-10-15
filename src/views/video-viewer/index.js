import React from 'react';
import { connect } from 'react-redux';

// project imports
import Grid from '@material-ui/core/Grid';
import MainCard from '../../ui-component/cards/MainCard';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';
import BabylonVideoRender from './babylonVideoRender';

import { useTheme } from '@material-ui/styles';
import useStyles from './styles';

import { fetchVideoGroupsAction } from '../video-group/video-groups.actions';
import { fetchUsers } from '../users/users.helper';

const VideoViewer = ({ user, fetchVideoGroupsAction, videoGroups, isLoading }) => {
    const theme = useTheme();
    const classes = useStyles();

    const [vGroups, setVideoGroups] = React.useState([]);
    const [isFetching, setIsFetching] = React.useState(false);

    const onSceneReady = (scene) => {
        // console.log("----------------")
        // console.log(scene)
        // console.log("----------------")
    };

    /*
    * Admin
    * 1. If admin get all the video groups
    * 2. Fetch videos in video groups
    *
    * Student or Instructor
    * 1. Fetch student or instructor
    * 2. Get video groups
    * 3. Fetch videos assigned to the video groups
    *
    * */

    /**
     * Will run on every frame render.  We are spinning the box on y-axis.
     */
    const onRender = (scene) => {
        // console.log("----------------")
        // console.log('Will run on every frame render.', scene)
        // console.log("----------------")
    };
    let mergedVideoGroups = [];

    const mergeById = (arr2) => {
        return [...mergedVideoGroups.concat(arr2).reduce((m, o) =>
                m.set(o.id, Object.assign(m.get(o.id) || {}, o))
            , new Map()).values()];
    };

    const loadData = React.useCallback(async () => {
        try {
            await setIsFetching(true);
            if (user.role === 'admin') {
                await fetchVideoGroupsAction();
            }
            if (user.role === 'student') {
                const response = await fetchUsers({
                    userId: user.id,
                    deepPopulate: 'videoGroups'
                });

                const assignedInstructors = response.results?.[0]?.instructors;
                if (assignedInstructors.length) {
                    assignedInstructors.map((instr) => {
                        mergedVideoGroups = mergeById(instr.videoGroups);
                    });
                }

                const studentVideoGrps = response.results?.[0]?.videoGroups;
                mergedVideoGroups = mergeById(studentVideoGrps);

                setVideoGroups(mergedVideoGroups);
            }
            if (user.role === 'instructor') {
                const response = await fetchUsers({
                    userId: user.id
                });
                setVideoGroups(response.results?.[0]?.videoGroups);
            }
            setIsFetching(false);
        } catch (e) {
            setIsFetching(false);
        }
    });

    React.useEffect(() => {
        loadData();
    }, []);

    React.useEffect(() => {
        if (user.role === 'admin') {
            setVideoGroups(videoGroups.results);
        }
    }, [videoGroups]);

    if (isFetching || isLoading) {
        return (
            <Grid className={classes.mainCardContainer}>
                <LoaderInnerCircular />
            </Grid>
        );
    }

    return (
        <MainCard boxShadow shadow={theme.shadows[16]}>
            <BabylonVideoRender
                id='my-canvas'
                antialias
                onSceneReady={onSceneReady}
                onRender={onRender}
                videoGroups={vGroups}
            />
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    user: state.authReducer.user,
    isLoading: state.videoGroupsReducer.isLoading,
    videoGroups: state.videoGroupsReducer.videoGroups
});

const mapDispatchToProps = (dispatch) => ({
    fetchVideoGroupsAction: (obj) => dispatch(fetchVideoGroupsAction(obj))
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoViewer);
