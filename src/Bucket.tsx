import {useGLTF} from '@react-three/drei';
import {staticFile} from 'remotion';

const modelSrc = staticFile('/3d-models/bucket.glb');

export function Bucket({position}) {
	const model = useGLTF(modelSrc);

	if (!model) {
		return null;
	}

	return <primitive position={position} object={model.scene} />;
}
