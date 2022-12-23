# mastodon-dev-for-misskey

Misskey開発のためにローカルで雑にMastodonを上げる。

production挙動でちゃんとしたドメインで連合することを目指す。

## Usage


### 雑にPostgreSQLとRedisを上げる

適当に別端末開いて `docker-compose up` してほっとくだけでOK

- PG: Port 52871, Redis: Port 52872 で上がる。 
- PGのDB名/ユーザー/パスワードは全部 `mastodon`
- DBを作るとか、RedisのDB IDどうするとかめんどくさいことはしなくていい

### 雑にMastodonの.env.productionを作る

```
yarn
npx ts-node src/genenv.ts
```
で、Mastodonのproduction用のconfig `.env.production` を生成される。

ドメインは適切に置き換える。

### Mastodonを構築

