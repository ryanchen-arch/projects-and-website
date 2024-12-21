// THIS FILE USED SOME AI TO HELP WITH CREATING THE CONTEXT. IT WAS MAINLY ASKING TO HELP FIX THE ERRORS WHEN I WAS WRITING IT
import React, { createContext, useContext, useState, ReactNode } from "react";

interface TemplateContextType {
	templateCode: string;
	setTemplateCode: React.Dispatch<React.SetStateAction<string>>;
}

// Create a context with an initial value of undefined, which will be provided later
const TemplateContext = createContext<TemplateContextType | undefined>(
	undefined
);

// TemplateProvider component to wrap around your app
interface TemplateProviderProps {
	children: ReactNode; // children prop type
}

export const TemplateProvider = ({
	children,
}: TemplateProviderProps): JSX.Element => {
	const [templateCode, setTemplateCode] = useState<string>(""); // Holds the template code

	return (
		<TemplateContext.Provider value={{ templateCode, setTemplateCode }}>
			{children}
		</TemplateContext.Provider>
	);
};

// Custom hook to use the Template context
export const useTemplateContext = (): TemplateContextType => {
	const context = useContext(TemplateContext);

	if (!context) {
		throw new Error(
			"useTemplateContext must be used within a TemplateProvider"
		);
	}

	return context;
};
