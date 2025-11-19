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

    // Check if the referenced component also has a $ref
    if (referencedComponent && typeof referencedComponent === 'object' && referencedComponent.$ref) {
        return [{
            message: `Component uses a $ref that points to another component which also contains a $ref. Chained refs (3rd level) are not allowed in components.`
        }];
    }
}

