module.exports = {
  root: true,
  extends: '@react-native',
  eslintConfig: {
    rules: {
      "prettier/prettier": [
        "error",
        {
          "endOfLine": "auto"
        },
      ],
    },
  },
};
