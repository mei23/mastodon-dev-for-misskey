# mastodon-dev-for-misskey

Misskey開発のためにローカルで雑にMastodonを上げる。

production挙動で開発環境でちゃんとしたドメインで連合することを目指す。

- ローカルのnginxでName-based Virtual Hostで動かすことを想定。
- SSL証明書はLet's Encryptなどで取って来ることを想定。
- ソースを多少触るかもなのでとりあえずDockerは、PostgreSQLとRedisのみ使うことにする

## Usage

### PostgreSQLとRedisを上げる

めんどくさいのでDockerで上げる

別端末を開いて `docker-compose up` してほっとくだけでOK

- PG: Port 52871, Redis: Port 52872 で上がる。 
- PGのDB名/ユーザー/パスワードは全部 `mastodon`
- DBを作るとか、RedisのDB IDどうするとかめんどくさいことはしなくていい

### Mastodonの.env.productionを作る

ウィザードめんどくさいので生成してしまう

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

Ownerアカウントを作る
```
docker-compose run --rm web bin/tootctl accounts create a --email a@localhost --confirmed --role Owner
```
が、Dockerだとチェックにかかって作れない。

```
sudo docker-compose up
```

### nginxをいい感じに設定する
https://github.com/mastodon/mastodon/blob/main/dist/nginx.conf
```
3000 => 52873
4000 => 52874
example.com => <ドメイン>
/home/mastodon/live/public => <Mastodonをcloneしたディレクトリ/public>
```
backend, streaming, cache path, cache key などが被りやすい

完了
