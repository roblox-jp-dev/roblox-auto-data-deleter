// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const password = process.env.AUTH_PASSWORD;

if (!password) {
  console.error('\x1b[31m%s\x1b[0m', 'エラー: AUTH_PASSWORDが設定されていません。');
  process.exit(1);
}

if (password.length < 9) {
  console.error('\x1b[31m%s\x1b[0m', 'エラー: AUTH_PASSWORDは9文字以上である必要があります。');
  process.exit(1);
}

const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
if (!hasSymbol) {
  console.error('\x1b[31m%s\x1b[0m', 'エラー: AUTH_PASSWORDには少なくとも1つの記号が含まれる必要があります。');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', 'パスワード検証OK');