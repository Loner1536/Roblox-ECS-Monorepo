// Packages
import Lync from "@rbxts/lync";

const Primitives = {
	u8: Lync.int(0, 255),
	u16: Lync.int(0, 65535),
	u32: Lync.int(0, 4294967295),

	i8: Lync.int(-128, 127),
	i16: Lync.int(-32768, 32767),
	i32: Lync.int(-2147483648, 2147483647),

	f16: Lync.f16,
	f32: Lync.f32,
	f64: Lync.f64,
} as const;

export default Primitives;
