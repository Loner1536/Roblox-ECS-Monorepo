// Packages
import { App, Args } from "@rbxts/forge";
import Vide from "@rbxts/vide";

@App({ group: "Template", name: "Template" })
export default class Template extends Args {
	render() {
		const { px } = this.props;

		return (
			<frame
				BackgroundTransparency={1}
				AnchorPoint={new Vector2(0.5, 1)}
				Position={() => new UDim2(0.5, 0, 1, px(-25))}
				Size={() => UDim2.fromOffset(px(250), px(100))}
			/>
		);
	}
}
