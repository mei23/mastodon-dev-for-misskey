# mastodon-dev-for-misskey

Misskey開発のためにローカルで雑にMastodonを上げる。

production挙動で開発環境でちゃんとしたドメインで連合することを目指す。

- ローカルのnginxでName-based Virtual Hostで動かすことを想定。
- SSL証明書はLet's Encryptなどで取って来ることを想定。
- ここではDockerイメージを使う

## Usage

このブランチをチェックアウト
```
git clone https://github.com/mei23/mastodon-dev-for-misskey -b mein
cd mastodon-dev-for-misskey
```

### Mastodonの.env.productionを作る

```
yarn
npx ts-node src/genenv.ts
```
で、Mastodonのproduction用のconfig `.env.production` が生成される。

ドメインは適切に置き換える。

### Mastodonを構築

DBスキーマ作成
```
docker-compose run --rm web rails db:migrate
```

Ownerアカウントを作ろうとするが
```
docker-compose run --rm web bin/tootctl accounts create a --email a@localhost --confirmed --role Owner
```
Dockerだとチェックにかかってしまうのでここでは作れない。

とりあえず上げる
```
sudo docker-compose up
```

### nginxをいい感じに設定する
https://github.com/mastodon/mastodon/blob/main/dist/nginx.conf

`3000` => `52873`  
`4000` => `52874`  
`example.com` => `<ドメイン>`  
`/home/mastodon/live/public` => `とりあえず何もないディレクトリに`  
`try_files $uri =404;` => `try_files $uri @proxy;`  

### 管理者アカウントの作成

Webにアクセスしてアカウントを登録。

以下のコマンドでメールアドレスを確認済みにしてアカウントをOwnerにする。
```
docker-compose run --rm web bin/tootctl accounts modify a --email a@localhost --confirm --role Owner
```

backend, streaming, cache path, cache key などが被りやすい

完了
