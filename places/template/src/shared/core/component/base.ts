// Packages
import createSerializer, { type Packed, type SerializerMetadata } from "@rbxts/serio";
import { type World, type Entity, Name } from "@rbxts/jecs";
import { Modding } from "@flamework/core";
import Replecs from "@rbxts/replecs";

type IncludesBlob<T> = T extends ["blob"]
	? true
	: T extends Array<infer U>
		? true extends IncludesBlob<U>
			? true
			: false
		: false;

export default class Base {
	constructor(protected world: World) {}

	protected LocalComponent<T>(name: string): Entity<T> {
		const component = this.world.component<T>();
		this.world.set(component, Name, name);
		return component;
	}
	protected LocalTag(name: string) {
		const tag = this.world.entity();
		this.world.set(tag, Name, name);
		return tag;
	}

	protected SharedTag(name: string) {
		const tag = this.world.entity();
		this.world.set(tag, Name, name);
		this.world.add(tag, Replecs.Shared);
		return tag;
	}

	/** @metadata macro */
	protected SerdesComponent<T>(
		name: string,
		meta?: Modding.Many<SerializerMetadata<Packed<T>>>,
		variants?: Modding.Many<IncludesBlob<SerializerMetadata<Packed<T>>>>,
	): Entity<T> {
		const serializer = createSerializer(meta);
		const component = this.world.component<T>();

		this.world.set(component, Name, name);
		this.world.set(
			component,
			Replecs.Serdes,
			identity<Replecs.SerdesTable>({
				includes_variants: variants as boolean as true,
				serialize: (value) => {
					const data = serializer.serialize(value as Packed<T>);
					return $tuple(data.buf!, variants ? data.blobs : undefined);
				},
				deserialize: (buf: buffer, blobs?: defined[]) => serializer.deserialize({ buf, blobs }),
			}),
		);

		this.world.add(component, Replecs.Shared);

		return component;
	}
}
