// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const password = process.env.AUTH_PASSWORD;
const allowedIP = process.env.ALLOWED_IP;

// パスワード検証
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

// IP制限の検証
if (!allowedIP || allowedIP.trim() === '') {
  console.error('\x1b[31m%s\x1b[0m', 'エラー: ALLOWED_IPが設定されていません。すべてのIPからのアクセスを許可する場合は "0.0.0.0" を設定してください。');
  process.exit(1);
}

// IPアドレスの形式を確認（シンプルなIPフォーマットチェック）
const ipPattern = /^((\d{1,3}\.){3}\d{1,3})(,\s*(\d{1,3}\.){3}\d{1,3})*$/;
if (!ipPattern.test(allowedIP)) {
  console.error('\x1b[31m%s\x1b[0m', 'エラー: ALLOWED_IPの形式が正しくありません。単一のIPアドレスまたはコンマ区切りのIPアドレスリストを指定してください。');
  console.error('\x1b[33m%s\x1b[0m', '例: "192.168.1.1" または "192.168.1.1, 10.0.0.1"');
  console.error('\x1b[33m%s\x1b[0m', 'すべてのIPからのアクセスを許可する場合は "0.0.0.0" を設定してください。');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', 'パスワード検証OK');
console.log('\x1b[32m%s\x1b[0m', 'IP制限設定OK');