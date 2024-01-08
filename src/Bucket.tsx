export function Bucket(props: {position: any; model: any}) {
	if (!props.model) {
		return null;
	}
	return <primitive position={props.position} object={props.model.scene} />;
}
