// Custom spectral linting function which checks if a component in components
// uses a $ref that points to another component which also has a $ref (chained refs)
// Learn more about custom spectral functions:
// https://docs.stoplight.io/docs/spectral/a781e290eb9f9-custom-functions

export default function noChainedRefsInComponents(input, options, context) {
    if (!input || typeof input !== 'object') {
        return;
    }

    // Check if this component has a $ref
    if (!input.$ref || typeof input.$ref !== 'string') {
        return;
    }

    // Only check refs that point to components (internal refs)
    if (!input.$ref.startsWith('#/components/')) {
        return;
    }

    // Get the document root to resolve the ref
    // Try different ways to access the document root
    let document = null;
    if (context.document) {
        document = context.document.data || context.document;
    } else if (context.documentInventory && context.documentInventory.document) {
        document = context.documentInventory.document.data || context.documentInventory.document;
    }
    
    if (!document || !document.components) {
        return;
    }

    // Parse the ref path (e.g., "#/components/schemas/MySchema" -> ["components", "schemas", "MySchema"])
    const refPath = input.$ref.replace('#/', '').split('/');
    
    // Navigate to the referenced component
    let referencedComponent = document;
    for (const segment of refPath) {
        if (referencedComponent && typeof referencedComponent === 'object' && segment in referencedComponent) {
            referencedComponent = referencedComponent[segment];
        } else {
            return; // Ref doesn't exist, skip
        }
    }

    // Helper function to check if a component has a $ref (directly or in properties)
    const hasRef = (component) => {
        if (!component || typeof component !== 'object') {
            return false;
        }
        // Check if component itself has a $ref
        if (component.$ref) {
            return true;
        }
        // Check if any property has a $ref
        if (component.properties) {
            for (const propName in component.properties) {
                const prop = component.properties[propName];
                if (prop && typeof prop === 'object' && prop.$ref) {
                    return true;
                }
            }
        }
        // Check items for arrays
        if (component.items && typeof component.items === 'object' && component.items.$ref) {
            return true;
        }
        return false;
    };

    // Extract component name from the ref path for better error messages
    const getComponentName = (ref) => {
        if (!ref) return 'unknown';
        const parts = ref.replace('#/components/', '').split('/');
        return parts.length > 0 ? parts[parts.length - 1] : ref;
    };

    // Get current component name from context path (e.g., ["components", "schemas", "ComponentA"])
    const getCurrentComponentName = () => {
        if (context.path && Array.isArray(context.path)) {
            // Find the component name in the path (usually the last segment before properties)
            const pathStr = context.path.join('/');
            const match = pathStr.match(/components\/[^\/]+\/([^\/]+)/);
            if (match) return match[1];
        }
        return 'this component';
    };

    const currentComponentName = getCurrentComponentName();
    const referencedComponentName = getComponentName(input.$ref);

    // Check if the referenced component also has a $ref (direct chaining)
    if (hasRef(referencedComponent)) {
        const nextRef = referencedComponent.$ref || 
            (referencedComponent.properties && Object.values(referencedComponent.properties).find(p => p?.$ref)?.$ref) ||
            (referencedComponent.items?.$ref);
        const nextComponentName = nextRef ? getComponentName(nextRef) : 'another component';
        
        return [{
            message: `Chained $ref detected: "${currentComponentName}" references "${referencedComponentName}" which also contains a $ref to "${nextComponentName}". Chained refs (3rd level or deeper) are not allowed in components. Flatten the reference chain by directly referencing the final component instead.`
        }];
    }

    // Check if any property in the referenced component has a $ref that points to a component with a $ref
    if (referencedComponent && typeof referencedComponent === 'object' && referencedComponent.properties) {
        for (const propName in referencedComponent.properties) {
            const prop = referencedComponent.properties[propName];
            if (prop && typeof prop === 'object' && prop.$ref && prop.$ref.startsWith('#/components/')) {
                // Resolve the property's referenced component
                const propRefPath = prop.$ref.replace('#/', '').split('/');
                let propReferencedComponent = document;
                for (const segment of propRefPath) {
                    if (propReferencedComponent && typeof propReferencedComponent === 'object' && segment in propReferencedComponent) {
                        propReferencedComponent = propReferencedComponent[segment];
                    } else {
                        break;
                    }
                }
                // Check if the property's referenced component has a $ref (creating a chain)
                if (hasRef(propReferencedComponent)) {
                    const propComponentName = getComponentName(prop.$ref);
                    const nextRef = propReferencedComponent.$ref || 
                        (propReferencedComponent.properties && Object.values(propReferencedComponent.properties).find(p => p?.$ref)?.$ref) ||
                        (propReferencedComponent.items?.$ref);
                    const nextComponentName = nextRef ? getComponentName(nextRef) : 'another component';
                    
                    return [{
                        message: `Chained $ref detected in property "${propName}": This property references "${propComponentName}" which also contains a $ref to "${nextComponentName}". Chained refs (3rd level or deeper) are not allowed in components. Flatten the reference chain by directly referencing the final component instead.`
                    }];
                }
            }
        }
    }
}

