/// <reference types="@rbxts/vide" />
/// <reference types="@rbxts/jecs" />

type Hashes = "TemplateHash" | "Template_CategoryHash";
type Hash<T extends Hashes> = number & { readonly __brand: T };
type BrandedHash<B extends Hashes, T> = T & {
	[K in `${Uncapitalize<B>}`]: Hash<B>;
} & { key: string };

type AppNames = "Template";
type AppGroups = "Template";

declare namespace Game {
	namespace Player {}
}

declare namespace Type {
	namespace Player {
		namespace Data {
			type Raw = {
				test: Type.Test.Player[];
			};

			type Sourced = {
				test: Vide.Source<Type.Test.Player[]>;
			};

			type Teleport = {};
		}
	}

	namespace Test {
		type Raw = {
			// Pure Data
		};

		type Player = {
			hash: number;
			level: number;
		};
	}
}
