import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import ToggleButtonGroup from '@material-ui/core/ToggleButtonGroup';
import ToggleButton from '@material-ui/core/ToggleButton';

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { IconMoodEmpty } from '@tabler/icons';

import moment from 'moment';

import {
    Engine, Scene,
    Vector3, ArcRotateCamera,
    VideoDome, PointerEventTypes
} from '@babylonjs/core';

import { PrettoSlider } from './ProgressBar';
import { videoNameMapper } from './videoNameMapper';

import useStyles from './videoRender.styles.js';

import XRiLoadingPoster from '../../../assets/xri/XRiPoster.png';
import XRiPlayBtn from '../../../assets/xri/xri_play.png';
import XRiPlayBtnFilled from '../../../assets/xri/xri_play_filledin.png';
import XRiPauseBtnFilled from '../../../assets/xri/xri_pause_filledin.png';
// import XRiPauseBtn from '../../../assets/xri/xri_pause.png';

import { fetchVideos } from '../../videos/videos.helper';
import {
    viewerRenderStartAction,
    viewerRenderPauseAction,
    viewerRenderStartFailureAction,
    viewerRenderRecordSessionAction
} from '../videoRender.actions';

const BabylonVideoViewer = (props) => {
    const reactCanvas = useRef(null);
    const videoProgressBarRef = useRef(null);

    const {
        antialias,
        engineOptions,
        adaptToDeviceRatio,
        sceneOptions,
        onRender,
        videoGroups
    } = props;

    let videoDome;
    let camera;

    const classes = useStyles();

    const [videosInSelectedGroup, setVideosInSelectedGroup] = useState(null);
    const [updatedVideoSource, setUpdatedVideoSource] = useState(null);
    const [selectedVideoSrc, setSelectedVideoSrc] = useState(null);
    const [currentViewBtn, setCurrentViewBtn] = useState('pause');
    const [videoProgress, setVideoProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [playedPercentage, setPlayedPercentage] = useState(0);
    const [selectedMediaDuration, setSelectedMediaDuration] = useState(100);
    const [sessionCurrentTime, setSessionCurrentTime] = useState(0);
    const [cameraDirection, setCameraDirection] = useState(null);
    const [selectedVG, setSelectedVG] = useState('');
    const currentSelectedVideo = videoNameMapper(selectedVideoSrc ? selectedVideoSrc.videoSrc : null);

    /* variable for session recording in server */
    let praxiViewerSession = {
        info: {},
        recordings: []
    };

    useEffect(() => {
        setSelectedVG(videoGroups?.[0]?.id || '');
        if (!videoGroups?.length) {
            setIsLoading(false);
        }
    }, [videoGroups]);

    const loadVideosForSelectedGroup = React.useCallback(async (groupId) => {
        try {
            await setIsLoading(true);
            const response = await fetchVideos({ group: groupId });
            await setVideosInSelectedGroup(response?.results || []);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
        }
    });

    useEffect(() => {
        if (selectedVG) {
            loadVideosForSelectedGroup(selectedVG);
        }
    }, [selectedVG]);

    const handleSelectChange = async (event) => {
        props.viewerRenderPauseAction();
        setVideoProgress(0);
        setSessionCurrentTime(0);
        setSelectedVG(event.target.value);
    };

    /* const handleRecordWatchLog = async (nextView) => {
         const viewerSession = props.viewerState.viewerSession;
         if (nextView === 'pause') {
             const watchLogDetails = {
                 'videoGroupId': selectedVG,
                 recordings: viewerSession
             };

             // console.log('handleRecordWatchLog', watchLogDetails);

             if (viewerSession?.info?.progress > 1 && viewerSession?.recordings?.length > 20) {
                 // console.log('watchLogDetails', JSON.stringify(viewerSession, null, 1));
                 console.log('watchLogDetails>>>>', watchLogDetails);
                 await addWatchLog(watchLogDetails);
             }
         }
     };*/

    const saveVideoProgressInSession = async (nextView) => {
        let prevSessionRecordings = [...praxiViewerSession.recordings];

        const videoCompleted = videoDome.videoTexture.video.currentTime === window['videoDome'].videoTexture.video.duration;
        setSessionCurrentTime(window['videoDome'].videoTexture.video.currentTime);

        /* Save video progress in session */
        const updatedVideos = updatedVideoSource?.map((item) => {
            if (item.videoSrc === selectedVideoSrc.videoSrc) {
                item.totalDuration = window['videoDome'].videoTexture.video.duration;
                item.currentTime = window['videoDome'].videoTexture.video.currentTime;
                item.screenRecords = [...item.screenRecords, ...prevSessionRecordings];
                item.cameraDirection = (camera ? camera.getForwardRay().direction : null) || cameraDirection;
                item.progress = videoCompleted ? 100 : parseFloat(playedPercentage);
            }
            return item;
        });

        await setUpdatedVideoSource(updatedVideos);
    };

    const handleSelectedVideoSrcChange = async (value) => {


        /* Set loading state on video select */
        await setIsLoading(true);

        /* Pause video if playing*/
        // videoDome = window['videoDome'];

        /* Update btn state */
        props.viewerRenderPauseAction();
        // await handleVideoControlChange('pause');

        /* Update selected video */
        setSelectedVideoSrc(value);
    };

    const handleVideoControlChange = async (nextView) => {

        /* Update button state */
        await setCurrentViewBtn(nextView);

        /* Update video state */
        videoDome = window['videoDome'];

        if (videoDome) {
            if (nextView === 'play') {
                await videoDome.videoTexture.video.play();
                props.viewerRenderStartAction();
                if (videoDome.videoTexture.video.currentTime === videoDome.videoTexture.video.duration) {
                    videoDome.videoTexture.video.currentTime = 0;
                }
                return;
            }

            if (nextView === 'pause') {
                videoDome.videoTexture.video.pause();
                await saveVideoProgressInSession();
                setTimeout(() => {
                    props.viewerRenderPauseAction();
                }, 2000);
                return;
            }
        }
    };

    const handleVideoProgress = async () => {
        videoDome = window['videoDome'];

        const currentTime = videoDome ? videoDome.videoTexture.video.currentTime : 0;
        const currentProgressTime = Math.floor(currentTime);
        const progressPercent = (((videoDome.videoTexture.video.currentTime / videoDome.videoTexture.video.duration) * 100) || 0).toFixed(2) || 0;
        const videoCompleted = videoDome.videoTexture.video.currentTime === window['videoDome'].videoTexture.video.duration;

        await setSessionCurrentTime(currentTime);
        await setVideoProgress(currentProgressTime);
        await setPlayedPercentage(progressPercent);
        await setCameraDirection(camera ? camera.getForwardRay().direction : null);

        praxiViewerSession.info.user = props.user;
        praxiViewerSession.info.videoPath = selectedVideoSrc.videoSrc;
        praxiViewerSession.info.videoGroupId = selectedVideoSrc.group.id;
        praxiViewerSession.info.videoGroupName = selectedVideoSrc.group.groupName;
        praxiViewerSession.info.videoFileName = currentSelectedVideo;
        praxiViewerSession.info.videoDuration = window['videoDome'] ? moment.utc(moment.duration(window['videoDome'].videoTexture.video.duration, 'seconds').asMilliseconds() - moment.duration(window['videoDome'].videoTexture.video.currentTime, 'seconds').asMilliseconds()).format('HH:mm:ss') : null;
        praxiViewerSession.info.currentVideoTime = window['videoDome'] ? moment.utc(moment.duration(window['videoDome'].videoTexture.video.currentTime, 'seconds').asMilliseconds()).format('HH:mm:ss') : null;
        praxiViewerSession.info.progress = videoCompleted ? 100 : parseFloat(progressPercent);
        praxiViewerSession.info.recordTime = moment().format('llll');

        praxiViewerSession.recordings.push({
            duration: window['videoDome'] ? window['videoDome'].videoTexture.video.duration : '',
            direction: camera ? camera.getForwardRay().direction : '',
            currentTime: window['videoDome'] ? window['videoDome'].videoTexture.video.currentTime : 0
        });

        props.viewerRenderRecordSessionAction(praxiViewerSession);

        /* Update btn view video ends*/
        if (videoCompleted) {
            handleVideoControlChange('pause');
        }
    };

    /* Create dynamic scene */
    const createDynamicScene = (canvas, scene, dome, engine, src, poster) => {
        let cameraTarget = Vector3.Zero();
        const resizeValue = 3;

        camera = new ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 2, 5, new Vector3(), scene);

        camera.attachControl(canvas, true);
        camera.inputs.attached.mousewheel.detachControl(canvas);

        window[`${dome}`] = new VideoDome(dome,
            [`${src}`],
            {
                poster: `${poster}`,
                resolution: 32,
                crossEyeMode: true,
                faceForward: true,
                generateMipMaps: true,
                clickToPlay: false,
                autoPlay: true,
                loop: false,
                size: 30 / resizeValue
            },
            scene
        );

        videoDome = window[`${dome}`];

        // videoDome.infiniteDistance = true;

        /* Video loader state */
        videoDome.videoTexture.onLoadObservable.add(async (data) => {
            setIsLoading(false);
            await setSelectedMediaDuration(Math.abs(window['videoDome'].videoTexture.video.duration));
            /* Update the video progress */
            window['videoDome'].videoTexture.video.addEventListener('timeupdate', handleVideoProgress);

            /* sync previous video session */
            const prevProgressTime = sessionCurrentTime || 0;
            window['videoDome'].videoTexture.video.currentTime = prevProgressTime;

            await setVideoProgress(Math.floor(prevProgressTime));

            if (selectedVideoSrc.cameraDirection) {
                const x = selectedVideoSrc.cameraDirection._x;
                const y = selectedVideoSrc.cameraDirection._y;
                const z = selectedVideoSrc.cameraDirection._z;
                cameraTarget = new Vector3(-x * 4, +y * 4, -z * 4);

                camera.setPosition(cameraTarget);
            }

            await window['videoDome'].videoTexture.video.pause();
        });

        /* Added mouse click pointer handler; play and pause */
        scene.onPointerObservable.add(async () => {
            if (videoDome) {
                console.log('praxiViewerSession>>>> viewerRenderRecordSessionAction', praxiViewerSession);
                await props.viewerRenderRecordSessionAction(praxiViewerSession);

                if (videoDome.videoTexture.video.paused) {
                    handleVideoControlChange('play');
                } else {
                    handleVideoControlChange('pause');
                }
            }
        }, PointerEventTypes.POINTERTAP);

        /* Added mouse camera direction handler and video status saving */
        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN:
                    saveVideoProgressInSession();
                    break;
                case PointerEventTypes.POINTERUP:
                    saveVideoProgressInSession();
                    break;
                case PointerEventTypes.POINTERMOVE:
                    break;
                default:
                    break;
            }
        });

        // Create VR Experience
        // const vrHelper = scene.createDefaultVRExperience();
        // vrHelper.enableInteractions();

        return scene;
    };

    /* Initialize video src */
    useEffect(() => {
        setUpdatedVideoSource(null);

        /* Update video source for */
        async function loadData() {
            if (videosInSelectedGroup?.length) {
                const videoScrViewerMapper = videosInSelectedGroup.map((item) => {
                    return {
                        ...item,
                        videoSrc: item.path,
                        totalDuration: 0,
                        cameraDirection: null,
                        progress: 0,
                        currentTime: 0,
                        screenRecords: []
                    };
                });
                await setUpdatedVideoSource(videoScrViewerMapper);
                // console.log('selectedVideoSrc', selectedVideoSrc);
                // console.log('videoScrViewerMapper[0]', videoScrViewerMapper[0]);
                await setSelectedVideoSrc(videoScrViewerMapper[0]);
                // await setSelectedVideoSrc(selectedVideoSrc ? selectedVideoSrc : videoScrViewerMapper[0]);
            } else {
                await setSelectedVideoSrc(null);
            }
        }

        loadData();
    }, [selectedVG, videosInSelectedGroup]);

    /* Initialize viewer */
    useEffect(() => {
        if (reactCanvas.current && selectedVideoSrc) {

            // const engine = new Engine(reactCanvas.current, true);
            const engine = new Engine(reactCanvas.current, antialias, engineOptions, adaptToDeviceRatio);
            const scene = new Scene(engine, sceneOptions);

            createDynamicScene(reactCanvas, scene, 'videoDome', engine, selectedVideoSrc?.videoSrc, XRiLoadingPoster);

            if (scene.isReady()) {
                props.onSceneReady(scene);
            } else {
                scene.onReadyObservable.addOnce((scene) => props.onSceneReady(scene));
            }

            engine.runRenderLoop(() => {
                if (typeof onRender === 'function') {
                    onRender(scene);
                }
                scene.render();
            });

            const resize = () => {
                scene.getEngine().resize();
            };

            if (window) {
                window.addEventListener('resize', resize);
            }

            return () => {
                scene.getEngine().dispose();

                if (window) {
                    window.removeEventListener('resize', resize);
                }
            };
        }
        // eslint-disable-next-line
    }, [reactCanvas, selectedVideoSrc, selectedVG]);

    useEffect(() => {
        praxiViewerSession.recordings = [];
    }, [selectedVideoSrc]);

    return (
        <>
            <Grid contianer='true' className={classes.videoSelectorMainContainer}>
                <Grid item className={`pb-6 ${classes.root}`} role='group' aria-label='Choose Video'>
                    {
                        !!(updatedVideoSource?.length) && updatedVideoSource.map((item, index) => {
                            return (
                                <Button
                                    key={`${index}`}
                                    variant={(selectedVideoSrc && (item.videoSrc === selectedVideoSrc.videoSrc)) ? 'contained' : 'outlined'}
                                    onClick={
                                        () => (item.videoSrc !== selectedVideoSrc.videoSrc) && handleSelectedVideoSrcChange(item)
                                    }
                                >
                                    {`Video${index + 1}`}
                                </Button>
                            );
                        })
                    }
                </Grid>
                <Grid item>
                    <FormControl className={classes.formControl}>
                        <Select
                            labelId='demo-simple-select-label'
                            id='demo-simple-select'
                            displayEmpty
                            value={selectedVG}
                            onChange={handleSelectChange}
                        >
                            <MenuItem value='' disabled>
                                Select video Group
                            </MenuItem>
                            {
                                !!videoGroups?.length ? videoGroups.map((item) => {
                                    return (
                                        <MenuItem key={item.id} value={item.id}>{item.groupName}</MenuItem>
                                    );
                                }) : (
                                    <MenuItem value='' disabled>
                                        <em>No video groups</em>
                                    </MenuItem>
                                )
                            }
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {
                !!(selectedVideoSrc && currentSelectedVideo) && (
                    <div className={classes.videoTitleContainer}>
                        <h5>{`Current Video: ${currentSelectedVideo}`}</h5>
                        {
                            !!(window['videoDome']) &&
                            <h5>{`Dimension: ${window['videoDome'].videoTexture.video.videoWidth}x${window['videoDome'].videoTexture.video.videoHeight}`}</h5>
                        }
                    </div>
                )
            }


            <>
                {(!!selectedVideoSrc) ? (
                    <canvas ref={reactCanvas} className={classes.canvasContainer} />
                ) : !isLoading && (
                    <Grid className={classes.canvasContainer}>
                        <IconMoodEmpty size='4rem' />
                        <span>
                            No videos available in selected group
                        </span>
                    </Grid>
                )}

                {/*<Grid className={classes.videoProgressInfoContainer}>*/}
                {/*    <h5>{`Progress: ${playedPercentage} %`}</h5>*/}
                {/*    <h5>{`Current Time: ${moment.utc(moment.duration(sessionCurrentTime, "seconds").asMilliseconds()).format("HH:mm:ss")}`}</h5>*/}
                {/*    <h5>{`Remaining Time: ${moment.utc(moment.duration(window['videoDome'].videoTexture.video.duration, "seconds").asMilliseconds() - moment.duration(sessionCurrentTime, "seconds").asMilliseconds()).format("HH:mm:ss")}`}</h5>*/}
                {/*</Grid>*/}

                {
                    !!selectedVideoSrc && (
                        <>
                            {
                                !!(window['videoDome'] && window['videoDome'].videoTexture.video.duration) && (
                                    <Grid className={classes.videoProgressInfoContainer}>
                                        <h5>{`Time: ${moment.utc(moment.duration(sessionCurrentTime, 'seconds').asMilliseconds()).format('HH:mm:ss')} / ${moment.utc(moment.duration(window['videoDome'].videoTexture.video.duration, 'seconds').asMilliseconds() - moment.duration(sessionCurrentTime, 'seconds').asMilliseconds()).format('HH:mm:ss')}`}</h5>
                                        <h5>{`Progress: ${playedPercentage} %`}</h5>
                                    </Grid>
                                )
                            }
                            <form className={classes.progressBarContainer}>
                                <ToggleButtonGroup
                                    orientation='vertical'
                                    value={currentViewBtn} exclusive
                                    onChange={(event, nextView) => handleVideoControlChange(nextView)}
                                    className={classes.videoBtnContainer}
                                >
                                    {
                                        currentViewBtn === 'pause' ? (
                                            <ToggleButton value='play' aria-label='module'>
                                                <img id='play-img' alt={'play'}
                                                     src={Math.abs(playedPercentage) === 100 ? XRiPlayBtn : XRiPlayBtnFilled}
                                                     width='20'
                                                     height='20' />
                                            </ToggleButton>
                                        ) : (
                                            <ToggleButton value='pause' aria-label='module'>
                                                <img id='pause-img' alt={'pause'} src={XRiPauseBtnFilled} width='20'
                                                     height='20' />
                                            </ToggleButton>
                                        )
                                    }
                                </ToggleButtonGroup>

                                <PrettoSlider
                                    id='videoProgressBar'
                                    disabled
                                    ref={videoProgressBarRef}
                                    valueLabelDisplay='auto'
                                    aria-label='pretto slider'
                                    aria-labelledby='continuous-slider'
                                    defaultValue={1}
                                    track={'normal'}
                                    min={0}
                                    max={selectedMediaDuration}
                                    value={videoProgress}
                                    onChange={(item, value) => {
                                        setVideoProgress(value);
                                    }}
                                    onChangeCommitted={() => {
                                        window['videoDome'].videoTexture.video.currentTime = videoProgress;
                                    }}
                                    className={classes.progressBar} />
                            </form>
                        </>
                    )
                }
            </>


            <Backdrop className={classes.backdrop} open={isLoading}>
                <CircularProgress color='inherit' />
            </Backdrop>
        </>
    );

};

const mapStateToProps = (state) => ({
    user: state.authReducer.user,
    viewerState: state.viewerReducer
});

const mapDispatchToProps = (dispatch) => ({
    viewerRenderStartAction: (Obj) => dispatch(viewerRenderStartAction(Obj)),
    viewerRenderPauseAction: (Obj) => dispatch(viewerRenderPauseAction(Obj)),
    viewerRenderStartFailureAction: (Obj) => dispatch(viewerRenderStartFailureAction(Obj)),
    viewerRenderRecordSessionAction: (Obj) => dispatch(viewerRenderRecordSessionAction(Obj))
});

export default connect(mapStateToProps, mapDispatchToProps)(BabylonVideoViewer);

