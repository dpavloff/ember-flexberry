module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'ember'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
  },
  overrides: [
    // node files
    {
      files: [
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
      })
    },

    // models of dummy application
    {
      files: [
        'tests/dummy/app/models/**/*.js',
        'tests/dummy/app/locales/**/*.js',
      ],
      rules: {
        'ember/avoid-leaking-state-in-ember-objects': 'off'
      }
    },

    // TODO Action objectListViewRowClick from route in controller and fix .eslintrc
    // TODO Action groupEditRowClick from route in controller and fix .eslintrc
    {
      files: [
        'addon/addon/components/flexberry-objectlistview.js',
        'addon/addon/components/flexberry-groupedit.js'
      ],
      rules: {
        'ember/closure-actions': 'off'
      }
    },

    {
      files: [
        'tests/integration/components/flexberry-ddau-checkbox-test.js',
      ],
      rules: {
        'ember/new-module-imports': 'off'
      }
    }
  ]
};
