// Shared
import { createFlatRegistry } from "@shared/api/definition/registry";

//
import Test from "./test";

const Template = createFlatRegistry("TemplateHash", {
	Test,
} as const);

export default Template;
