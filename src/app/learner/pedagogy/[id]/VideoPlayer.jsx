import React, { useRef, useEffect } from 'react';
import { update_pedagogy_Status, update_user_learning_time } from '@/api/get';
import { toast } from 'react-toastify';
import ReactPlayer from 'react-player';

const VideoSection = ({ activePeda, course_id, module_id }) => {
    const videoRef = useRef(null);
    const hasPlayedRef = useRef(true);
    const cleanupIntervalRef = useRef(null);
    const time_spent_interval = 12000;

    useEffect(() => {
        videoRef.current = null;
        hasPlayedRef.current = false;
        cleanupIntervalRef.current = null;
        return () => {
            if (cleanupIntervalRef.current) {
                clearInterval(cleanupIntervalRef.current);
            }
        };
    }, [activePeda, course_id, module_id]);

    const playVideo = () => {
        if (videoRef.current) {
            videoRef.current.getInternalPlayer().play();
        }
    };

    const callApi = async (time) => {
        try {
            const resp = await update_pedagogy_Status({
                pedagogy_id: activePeda._id,
                module_id,
                learning_sec: time,
                course_id
            });
            if (resp.error) {
                toast.info("Unable to save watch history");
            } else {
                toast.info("Watch history saved");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const updateSpentTime = async () => {
        try {
            await update_user_learning_time({
                pedagogy_id: activePeda._id,
                module_id,
                course_id,
                time_stamp: time_spent_interval / 1000
            });
        } catch (error) {
            toast.error("Error updating learning time: " + error.message);
        }
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                cleanupIntervalRef.current = setInterval(() => {
                    updateSpentTime();
                }, time_spent_interval);
            } else {
                clearInterval(cleanupIntervalRef.current);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(cleanupIntervalRef.current);
        };
    }, []);

    const handleProgress = (progress) => {
        const currentTime = Math.floor(progress.playedSeconds); // Get the current time from the progress object
        if (!hasPlayedRef.current && currentTime >= activePeda.avg_time) {
            hasPlayedRef.current = true;
            callApi(currentTime);
        }
    };

    return (
        <div className="video-section">
            <div className="video-box">
                <ReactPlayer
                    url={activePeda.url}
                    // onReady={playVideo}
                    // playing={true}
                    controls
                    ref={videoRef}
                    width="100%"
                    height="100%"
                    onProgress={handleProgress} // Use onProgress to track playback time
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload', // Disable download button
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default VideoSection;
