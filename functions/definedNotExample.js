// Custom spectral linting function which throws exception only if target is undefined AND is not within an example (any level)
// Learn more about custom spectral functions:
// https://docs.stoplight.io/docs/spectral/a781e290eb9f9-custom-functions

export default function definedNotExample (input, options, context) {
    if (!context.path.includes('example') && input == undefined) {
        return [{message: 'error'}]
    }
}