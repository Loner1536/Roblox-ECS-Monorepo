// Shared
import { createCategoryRegistry } from "@shared/api/definition/registry";

// Categories
import Category from "./category";

const Template_Category = createCategoryRegistry("Template_CategoryHash", {
	Category,
});

export default Template_Category;
