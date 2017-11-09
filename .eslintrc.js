module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": ["warn", 4],
        "quotes": [
            "error",
            "double",
            {
                "allowTemplateLiterals": true
            }
        ],
        "semi": ["error", "always"],
        "comma-dangle": ["error", "always-multiline"],
        "no-shadow": "warn",
        "no-shadow-restricted-names": "error",
        "no-unused-vars": [
            "warn",
            {
                "vars": "local",
                // Don't warn about unused CONFIG, SITE, log, logInfo, logWarning, logError:
                "varsIgnorePattern": "^(CONFIG)|(SITE)|(log((Info)|(Warning)|(Error))?)$",
            }
        ],
        "no-console": 0,
    }
};
