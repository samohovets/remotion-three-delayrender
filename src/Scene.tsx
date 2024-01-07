import {Series, random, staticFile} from 'remotion';
import {getVideoMetadata, VideoMetadata} from '@remotion/media-utils';
import {ThreeCanvas, useVideoTexture} from '@remotion/three';
import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, useVideoConfig, Video} from 'remotion';
import {LoopedVideoPhone, Phone} from './Phone';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {Bucket} from './Bucket';
import {Environment} from '@react-three/drei';

const container: React.CSSProperties = {
	backgroundColor: 'white',
};

const phoneVideo = staticFile('phone.mp4');

const scenes = [
	{
		objects: [
			{
				type: 'phone',
				position: [2, 0, 0],
				videoSrc: phoneVideo,
			},
			{
				type: 'bucket',
				position: [0, 0, -2],
			},
		],
		durationInFrames: 400,
	},
	{
		objects: [
			{
				type: 'phone',
				position: [-0.3, 0, 0],
				videoSrc: phoneVideo,
			},
			{
				type: 'bucket',
				position: [2, 0, -2],
			},
		],
		durationInFrames: 300,
	},
	{
		objects: [
			{
				type: 'phone',
				position: [1, 0, 0],
				videoSrc: phoneVideo,
			},
			{
				type: 'bucket',
				position: [-2, 1, -2],
			},
		],
		durationInFrames: 300,
	},
];

export const Scene: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<AbsoluteFill style={container}>
			<ThreeCanvas linear width={width} height={height}>
				<Environment preset="lobby" />
				<ambientLight intensity={1.5} color={0xffffff} />
				<pointLight position={[10, 10, 0]} />
				<Series>
					{scenes.map((scene, sceneIndex) => (
						<Series.Sequence
							key={sceneIndex}
							layout="none"
							durationInFrames={scene.durationInFrames}
						>
							{scene.objects.map((obj, index) => {
								if (obj.type === 'phone') {
									return (
										<LoopedVideoPhone
											key={index}
											phoneColor="black"
											aspectRatio={9 / 16}
											videoSrc={obj.videoSrc!}
											baseScale={1}
											position={obj.position}
										/>
									);
								}
								if (obj.type === 'bucket') {
									return <Bucket key={index} position={obj.position} />;
								}
								return null;
							})}
						</Series.Sequence>
					))}
				</Series>
			</ThreeCanvas>
		</AbsoluteFill>
	);
};
