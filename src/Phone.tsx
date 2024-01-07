import {useThree} from '@react-three/fiber';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
	Internals,
	Loop,
	cancelRender,
	continueRender,
	delayRender,
	getRemotionEnvironment,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {VideoTexture} from 'three';
import {
	CAMERA_DISTANCE,
	getPhoneLayout,
	PHONE_CURVE_SEGMENTS,
	PHONE_SHININESS,
} from './helpers/layout';
import {roundedRect} from './helpers/rounded-rectangle';
import {RoundedBox} from './RoundedBox';
import {useOffthreadVideoTexture, useVideoTexture} from '@remotion/three';
import {NoReactInternals} from 'remotion/no-react';
import {useVideoRef} from './hooks/use-video-texture';
import {getVideoMetadata} from '@remotion/media-utils';

function useIsomorphVideoTexture({
	src,
	playbackRate = 1,
}: {
	src: string;
	playbackRate?: number;
}) {
	const {isRendering} = getRemotionEnvironment();

	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const mediaStartsAt = Internals.useMediaStartsAt();

	const currentTime = useMemo(() => {
		return (
			NoReactInternals.getExpectedMediaFrameUncorrected({
				frame,
				playbackRate,
				startFrom: -mediaStartsAt,
			}) / fps
		);
	}, [frame, playbackRate, mediaStartsAt, fps]);

	const {videoRef} = useVideoRef({src, currentTime});

	if (isRendering) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useOffthreadVideoTexture({src, playbackRate});
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	return useVideoTexture(videoRef);
}

export const Phone: React.FC<{
	videoSrc: string;
	aspectRatio: number;
	baseScale: number;
	phoneColor: string;
	position: number[];
}> = ({aspectRatio, videoSrc, baseScale, phoneColor, position}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	const videoTexture = useIsomorphVideoTexture({
		src: videoSrc,
		playbackRate: 1,
	});

	const layout = useMemo(
		() => getPhoneLayout(aspectRatio, baseScale),
		[aspectRatio, baseScale]
	);

	// Place a camera and set the distance to the object.
	// Then make it look at the object.
	const camera = useThree((state) => state.camera);
	useEffect(() => {
		camera.position.set(0, 0, CAMERA_DISTANCE);
		camera.near = 0.2;
		camera.far = Math.max(5000, CAMERA_DISTANCE * 2);
		camera.lookAt(0, 0, 0);
	}, [camera]);

	// Make the video fill the phone texture
	useEffect(() => {
		if (videoTexture) {
			videoTexture.repeat.y = 1 / layout.screen.height;
			videoTexture.repeat.x = 1 / layout.screen.width;
		}
	}, [aspectRatio, layout.screen.height, layout.screen.width, videoTexture]);

	// During the whole scene, the phone is rotating.
	// 2 * Math.PI is a full rotation.
	const constantRotation = interpolate(
		frame,
		[0, durationInFrames],
		[0, Math.PI * 6]
	);

	// When the composition starts, there is some extra
	// rotation and translation.
	const entranceAnimation = spring({
		frame,
		fps,
		config: {
			damping: 200,
			mass: 3,
		},
	});

	// Calculate the entrance rotation,
	// doing one full spin
	const entranceRotation = interpolate(
		entranceAnimation,
		[0, 1],
		[-Math.PI, Math.PI]
	);

	// Calculating the total rotation of the phone
	const rotateY = entranceRotation + constantRotation;

	// Calculating the translation of the phone at the beginning.
	// The start position of the phone is set to 4 "units"
	const translateY = interpolate(entranceAnimation, [0, 1], [-4, 0]);

	// Calculate a rounded rectangle for the phone screen
	const screenGeometry = useMemo(() => {
		return roundedRect({
			width: layout.screen.width,
			height: layout.screen.height,
			radius: layout.screen.radius,
		});
	}, [layout.screen.height, layout.screen.radius, layout.screen.width]);

	return (
		<group
			scale={entranceAnimation}
			rotation={[0, rotateY, 0]}
			position={position}
		>
			<RoundedBox
				radius={layout.phone.radius}
				depth={layout.phone.thickness}
				curveSegments={PHONE_CURVE_SEGMENTS}
				position={layout.phone.position}
				width={layout.phone.width}
				height={layout.phone.height}
			>
				<meshPhongMaterial color={phoneColor} shininess={PHONE_SHININESS} />
			</RoundedBox>
			<mesh position={layout.screen.position}>
				<shapeGeometry args={[screenGeometry]} />
				{videoTexture ? (
					<meshBasicMaterial
						color={0xffffff}
						toneMapped={false}
						map={videoTexture}
					/>
				) : null}
			</mesh>
		</group>
	);
};

export const LoopedVideoPhone = (props: any) => {
	const {fps} = useVideoConfig();

	const [videoDuration, setVideoDuration] = useState<number | undefined>(5);

	// TODO: everything below is commented out because I have no idea why continueRender is not working
	// const [videoDurationHandle] = useState(() => delayRender('videoDuration'));

	// const getVideoDuration = useCallback(async () => {
	// 	try {
	// 		const metadata = await getVideoMetadata(props.videoSrc);

	// 		setVideoDuration(metadata.durationInSeconds);
	// 		continueRender(videoDurationHandle);
	// 	} catch (error) {
	// 		console.error(error);
	// 		cancelRender(error);
	// 	}
	// }, []);

	// useEffect(() => {
	// 	getVideoDuration();
	// }, [getVideoDuration]);

	if (!videoDuration) {
		return null;
	}

	return (
		<Loop layout="none" durationInFrames={Math.floor(fps * videoDuration)}>
			<Phone {...props} />
		</Loop>
	);
};
