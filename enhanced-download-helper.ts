import { DownloadHelper, DownloadUtils } from 'download-helper/download-helper';

/**
 * Zip64対応のダウンロードヘルパー
 * @zip.js/zip.jsを使用して4GB以上のZIPファイル作成をサポート
 */
export class EnhancedDownloadHelper extends DownloadHelper {
	/**
	 * Zip64対応のZIPダウンロード
	 * @param downloadObj ダウンロード対象オブジェクト
	 * @param progress 進捗率出力関数
	 * @param log ログ出力関数
	 * @param remainTime 終了予測出力関数
	 */
	async downloadZipWithZip64(
		downloadObj: any,
		progress: (n: number) => void,
		log: (s: string) => void,
		remainTime: (r: string) => void,
	) {
		if (!this.isDownloadJsonObj(downloadObj)) {
			throw new Error('ダウンロード対象オブジェクトの型が不正');
		}

		const utils = this.utils;

		// 外部ライブラリの読み込み
		await utils.embedScript('https://unpkg.com/@zip.js/zip.js/index.js');
		await utils.embedScript('https://cdn.jsdelivr.net/npm/streamsaver@2.0.6/StreamSaver.js');

		const encodedId = utils.encodeFileName(downloadObj.id);

		// StreamSaver.jsでダウンロードストリーム作成
		const fileStream = (window as any).streamSaver.createWriteStream(`${encodedId}.zip`);

		// zip.jsのZipWriterを作成 (WritableStreamに直接書き込み)
		const { ZipWriter, TextReader } = (window as any);
		const zipWriter = new ZipWriter(fileStream, {
			// Zip64を強制有効化 (4GB+対応)
			zip64: true,
			// 圧縮レベル設定 (0-9, 0=無圧縮, 9=最高圧縮)
			level: 6,
			// ストリーミング最適化
			bufferedWrite: false,
			// AES-256暗号化（オプション）
			// password: "your-password-here",
			// encryptionStrength: 3,
		});

		try {
			const startTime = Math.floor(Date.now() / 1000);
			let count = 0;

			log(`@${downloadObj.id} 投稿:${downloadObj.postCount} ファイル:${downloadObj.fileCount}`);

			// ルートHTML追加
			await zipWriter.add('index.html', new TextReader(this.createRootHtmlFromPosts(downloadObj)));

			// 各投稿を処理
			let postCount = 0;
			for (const post of downloadObj.posts) {
				log(`${post.originalName} (${++postCount}/${downloadObj.postCount})`);

				// 投稿情報ファイル
				const informationFile = utils.createInformationFile(post.informationText);
				await zipWriter.add(
					`${post.encodedName}/${utils.encodeFileName(informationFile.name)}`,
					new TextReader(Array.isArray(informationFile.content) ? informationFile.content.join('') : informationFile.content),
				);

				// 投稿HTML
				await zipWriter.add(
					`${post.encodedName}/index.html`,
					new TextReader(this.createHtmlFromBody(post.originalName, post.htmlText)),
				);

				// カバー画像
				if (post.cover) {
					log(`download ${post.cover.name}`);
					try {
						const response = await fetch(post.cover.url);
						if (response.ok && response.body) {
							// ReadableStreamを直接使用 (メモリ効率が良い)
							await zipWriter.add(`${post.encodedName}/${post.cover.name}`, response.body);
						}
					} catch (error) {
						console.error(`カバー画像のダウンロードに失敗: ${post.cover.name}`, error);
						log(`カバー画像のダウンロードに失敗: ${post.cover.name}`);
					}
				}

				// 各ファイル処理
				let fileCount = 0;
				for (const file of post.files) {
					log(`download ${file.encodedName} (${++fileCount}/${post.files.length})`);

					try {
						const response = await fetch(file.url);
						if (response.ok && response.body) {
							// ストリーミング追加 (メモリ使用量を抑制)
							await zipWriter.add(`${post.encodedName}/${file.encodedName}`, response.body);
						} else {
							throw new Error(`HTTP ${response.status}`);
						}
					} catch (error) {
						console.error(`${file.encodedName}(${file.url})のダウンロードに失敗:`, error);
						log(`${file.encodedName}のダウンロードに失敗`);
					}

					count++;

					// 進捗更新
					setTimeout(() => {
						const remain = Math.floor(
							(Math.abs(Math.floor(Date.now() / 1000) - startTime) * (downloadObj.fileCount - count)) / count,
						);
						const h = Math.floor(remain / (60 * 60));
						const m = Math.ceil((remain - 60 * 60 * h) / 60);
						remainTime(`${h}:${('00' + m).slice(-2)}`);
						progress(Math.floor((count * 100) / downloadObj.fileCount));
					}, 0);

					await utils.sleep(100);
				}
			}

			// ZIPファイルを完成
			await zipWriter.close();
			log('ZIPファイル作成完了 (Zip64対応)');
		} catch (error) {
			console.error('ZIP作成エラー:', error);
			throw error;
		}
	}

	/**
	 * Zip64対応のダウンロードUIを作成する
	 * @param title ダウンローダーの名前
	 */
	async createEnhancedDownloadUI(title: string) {
		// 基本のUIを作成
		await super.createDownloadUI(title);

		// ボタンのクリックイベントを上書きしてZip64対応版を使用
		const button = document.querySelector('.btn-labeled') as HTMLButtonElement;
		const input = document.querySelector('.form-control') as HTMLInputElement;
		const progress = document.querySelector('.progress-bar') as HTMLElement;
		const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
		const remainTimeDiv = document.querySelector('.float-end') as HTMLElement;
		const checkBox = document.querySelector('#LogCheck') as HTMLInputElement;

		if (button && input) {
			// 既存のイベントリスナーを削除して新しいものを設定
			button.onclick = async () => {
				button.disabled = true;
				const loadingFun = (event: BeforeUnloadEvent) => (event.returnValue = 'downloading');
				window.addEventListener('beforeunload', loadingFun);

				const setProgress = (n: number) => {
					progress.setAttribute('aria-valuenow', `${n}`);
					progress.style.width = `${n}%`;
					progress.innerText = `${n}%`;
				};

				const textLog = (t: string) => {
					textarea.value += `${t}\n`;
					if (checkBox.checked) {
						textarea.scrollTop = textarea.scrollHeight;
					}
				};

				const setRemainTime = (r: string) => (remainTimeDiv.innerText = `残りおよそ ${r}`);

				try {
					// Zip64対応版のdownloadZipを使用
					await this.downloadZipWithZip64(JSON.parse(input.value), setProgress, textLog, setRemainTime);
				} catch (e) {
					textLog('エラー出た (Zip64対応版で再試行)');
					console.error(e);
					
					// フォールバック: 元のdownloadZipを試行
					try {
						textLog('標準版で再試行中...');
						await super.downloadZip(JSON.parse(input.value), setProgress, textLog, setRemainTime);
					} catch (e2) {
						textLog('標準版も失敗しました');
						console.error(e2);
					}
				} finally {
					window.removeEventListener('beforeunload', loadingFun);
					button.disabled = false;
				}
			};
		}
	}
}
