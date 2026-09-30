# connpass イベント活動の記録

`tomo_kusaba` のconnpass公開イベントを、参加・主催・登壇に分けて表示する静的サイトです。HTML/CSS/JavaScriptで構成し、Azure Static Web Appsへそのまま配置できます。イベント情報はページのビルドごとに変わらないテンプレートから描画するため、日次更新でレイアウトは変化しません。

## 初回公開

1. Azure Static Web Appsを作成し、デプロイトークンをGitHubリポジトリの `Settings > Secrets and variables > Actions` に `AZURE_STATIC_WEB_APPS_API_TOKEN` として登録します。
2. `main` に変更をpushするか、Actionsの **Deploy static site** を手動実行します。
3. `public/data/events.json` はAPIキーを登録するまで空の初期状態です。

デプロイトークンがない場合、デプロイworkflowは警告を出してスキップします。

## connpassの日次更新

1. connpass API v2の利用申請を行い、発行されたAPIキーを同じGitHub Actions secrets画面で `CONNPASS_API_KEY` として登録します。
2. `Refresh Connpass events` workflowが毎日06:00 JSTに参加・主催・登壇の公開イベントを取得し、Azure Static Web Appsへデプロイします。workflow_dispatchから手動実行もできます。

データ取得はconnpass API v2のみを使います。APIキーはActions内でHTTPヘッダーに渡し、Gitリポジトリや公開ファイルには保存しません。取得したJSONは `public/data/events.json` にコミットした後、同じworkflow実行中に静的サイトへデプロイします。全ページを取得し、APIの1秒あたり1リクエスト制限に合わせて間隔を空けます。取得に失敗した場合はworkflowを失敗させ、既存の公開サイトは置き換えません。APIキーが未登録の場合は明示的な警告を出して日次更新をスキップします。

更新処理をローカルで実行する場合:

```powershell
$env:CONNPASS_API_KEY = "発行されたAPIキー"
npm run sync
```

## 確認

```powershell
npm test
```

サイトはWCAG 2.2 AAを目標に、見出しとランドマーク、キーボード操作可能な絞り込み、明示ラベル、フォーカス表示、色に依存しない活動区分、縮小表示への対応を備えています。
