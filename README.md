# fanbox-downloader

pixiv FANBOXの投稿を投稿毎にフォルダ分け → ZIPとして一括ダウンロードするブックマークレット

**🎉 NEW: Zip64対応で4GB以上の大容量ZIPファイル作成が可能になりました！**

自分用、性欲駆動開発

## ✨ 主な機能

- 📁 投稿毎の自動フォルダ分け
- 🗜️ **Zip64対応** - 4GB以上のZIPファイル作成可能
- 📝 投稿情報（テキスト、メタデータ）の保存
- 🖼️ 画像・動画・ファイルの一括ダウンロード
- 💾 メモリ効率の良いストリーミング処理
- 🔄 元のダウンロード方式との互換性維持

## 🚀 使い方

- https://furubarug.github.io/fanbox-downloader/

↓ブックマークレット
```javascript
javascript:import("https://furubarug.github.io/fanbox-downloader/fanbox-downloader.min.js").then(m=>m.main()).catch(e=>alert(`エラー出た(${e})`));
```

## 🆕 Zip64対応について

従来版では4GBの制限がありましたが、新版では[@zip.js/zip.js](https://github.com/gildas-lormeau/zip.js)を使用することで：

- ✅ **4GB以上のZIPファイル作成**が可能
- ✅ **AES-256暗号化**対応（オプション）
- ✅ **ストリーミング処理**でメモリ使用量を削減
- ✅ **圧縮機能**でファイルサイズ削減
- ✅ **フォールバック機能**で従来版との互換性

### 注意事項

- Windows標準のZIP機能では、AES暗号化されたZIPファイルは開けません
- 7-Zip、WinZip等の対応ソフトウェアが必要です
- 従来版で問題が発生した場合、自動的にフォールバックします

## 📋 既知の問題

- ~~4GB超えるとZIP解凍時にエラーが出る~~ → **✅ Zip64対応で解決！**
- ファイル表示のリンクで`download`属性が機能してない（ファイル名重複時に元ファイル名に戻せない）

## 🛠️ 技術仕様

### 依存関係

- `download-helper`: 基本的なダウンロード機能
- `@zip.js/zip.js`: Zip64対応とストリーミング処理

### アーキテクチャ

```
EnhancedDownloadHelper (新) 
├── @zip.js/zip.js (Zip64対応)
├── StreamSaver.js (ファイル保存)
└── DownloadHelper (従来版フォールバック)
```

## 🔄 fork後の変更点

- 対応するURLを少し増やした
- 投稿毎にフォルダ分けしたZIPでダウンロードするよ
- 投稿の文章とかの情報もそれっぽく保存
- コードが長くなったから外部から読み込むようにした
- **🆕 Zip64対応で4GB以上のファイル作成可能**

## 💻 開発用TIPS

- tsコンパイル

```bash
# yarn run build
npm run build
```

### 開発環境

```bash
# 依存関係のインストール
npm install

# TypeScriptコンパイル
npm run build

# Linting
npm run lint
```

## 📊 バージョン履歴

- **v3.6.0**: Zip64対応追加、4GB以上のZIPファイル作成可能
- v3.5.0: 基本機能
