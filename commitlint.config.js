export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'docs', // documentation update
        'style', // code formatting
        'refactor', // code refactoring
        'perf', // performance optimization
        'test', // testing
        'chore', // build process or auxiliary tools
        'revert', // revert changes
        'build', // build related
      ],
    ],
    'subject-max-length': [2, 'always', 72],
    'subject-case': [2, 'never', ['upper-case']],
  },
};
