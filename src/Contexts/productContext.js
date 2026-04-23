import React, { createContext, useContext } from "react";

export const ProductContext = createContext();

export function useProduct() {
	const context = useContext(ProductContext);
	if (!context) {
		throw new Error("useProduct must be used within a ProductProvider");
	}
	return context;
}
