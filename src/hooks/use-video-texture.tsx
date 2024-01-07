import {useEffect, useMemo, useRef} from 'react';

export const useVideoRef = ({
	src,
	currentTime,
}: {
	src: string;
	currentTime: number;
}) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	const videoElement = useMemo(() => {
		const video = document.createElement('video');
		video.muted = true;
		video.src = src;
		video.style.display = 'none';

		// CrossOrigin="anonymous" is important to allow CORS-enabled servers
		// to be read from a canvas
		video.crossOrigin = 'anonymous';

		return video;
	}, [src]);

	useEffect(() => {
		document.body.appendChild(videoElement);

		videoRef.current = videoElement;

		return () => {
			document.body.removeChild(videoElement);
		};
	}, [videoElement]);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.currentTime = currentTime;
		}
	}, [currentTime]);

	return {videoRef};
};
