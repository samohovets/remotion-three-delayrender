import {getVideoMetadata} from '@remotion/media-utils';
import {Composition} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {Scene, scenes} from './Scene';

// Welcome to the Remotion Three Starter Kit!
// Two compositions have been created, showing how to use
// the `ThreeCanvas` component and the `useVideoTexture` hook.

// You can play around with the example or delete everything inside the canvas.

// Remotion Docs:
// https://remotion.dev/docs

// @remotion/three Docs:
// https://remotion.dev/docs/three

// React Three Fiber Docs:
// https://docs.pmnd.rs/react-three-fiber/getting-started/introduction

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Scene"
				component={Scene}
				durationInFrames={900}
				fps={60}
				width={1280}
				height={720}
				defaultProps={{
					deviceType: 'phone',
					phoneColor: 'rgba(110, 152, 191, 0.00)' as const,
					baseScale: 1,
				}}
				calculateMetadata={async ({props}) => {
					const sources = scenes
						.map((scene) => scene.objects.map((obj) => obj.videoSrc))
						.flat(1)
						.filter(NoReactInternals.truthy);

					const durations = Object.fromEntries(
						await Promise.all(
							sources.map(async (source) => {
								const {durationInSeconds} = await getVideoMetadata(source);
								return [source, durationInSeconds] as const;
							})
						)
					);

					return {
						props: {
							...props,
							durations,
						},
					};
				}}
			/>
		</>
	);
};
