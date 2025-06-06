module.exports = {
    extends: ['@commitlint/config-conventional'],
    plugins: ['commitlint-plugin-function-rules'],
    rules: {
        'type-enum': [
            2,
            'always',
            ['new', 'fix', 'update', 'remove', 'docs', 'feat', 'test', 'chore']
        ],
        'scope-case': [2, 'always', 'kebab-case'],
        'scope-empty': [
            2,
            'never',
            ['new'] // "new" requires scope
        ],
        'scope-empty': [
            0,
            'always',
            ['fix'] // "fix" and "media" allow optional scopes
        ],
        'function-rules/scope-enum': [
            2,
            'always',
            (parsed) => {
                const allowedScopes = {
                    new: ['api', 'endpoint', 'parameter'],
                    fix: ['typo', 'broken-link', 'markdown']
                };

                const { type, scope } = parsed;

                // Only validate scopes for "new" and "fix"
                if (!allowedScopes[type]) return [true];

                // Validate "new" scopes
                if (type === 'new' && !allowedScopes.new.includes(scope)) {
                    return [false, `new() scope must be one of: ${allowedScopes.new.join(', ')}`];
                }

                // Validate "fix" scopes (if used)
                if (type === 'fix' && scope && !allowedScopes.fix.includes(scope)) {
                    return [false, `fix() scope must be one of: ${allowedScopes.fix.join(', ')}`];
                }

                return [true];
            }
        ]
    }
};
