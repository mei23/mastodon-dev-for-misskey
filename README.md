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

Ubuntu 18.04, 20.04, 22.04 あたりでこのあたりが必要
```
sudo apt update
sudo apt install -y \
  imagemagick ffmpeg libpq-dev libxml2-dev libxslt1-dev file git-core \
  g++ libprotobuf-dev protobuf-compiler pkg-config nodejs gcc autoconf \
  bison build-essential libssl-dev libyaml-dev libreadline6-dev \
  zlib1g-dev libncurses5-dev libffi-dev libgdbm-dev \
  nginx redis-server redis-tools postgresql postgresql-contrib \
  certbot python3-certbot-nginx libidn11-dev libicu-dev libjemalloc-dev
```

どこか別のディレクトリでMastodonをチェックアウト
```
git clone https://github.com/mastodon/mastodon.git
cd mastodon
git checkout <バージョン>
```

必要ならrbenvなどをインストール
```
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
cd ~/.rbenv && src/configure && make -C src
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
exec bash
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
```

必要ならRubyをインストール (バージョンは `.ruby-version` を参照)
```
rbenv install 3.0.4
```

依存関係のインストール
```
gem install bundler --no-document
bundle config deployment 'true'
bundle config without 'development test'
bundle install -j$(getconf _NPROCESSORS_ONLN)
# だらだらwarningが出てきて成功したかわからないが `echo $?` で `0` が返ってくればたぶん成功している

yarn install --pure-lockfile
```

さっき作った `.env.production` をコピーしてくる
```
cp -i ../mastodon-dev-for-misskey/.env.production .
```

DBスキーマ作成
```
RAILS_ENV=production bundle exec rails db:migrate
```

assets:precompile
```
RAILS_ENV=production bundle exec rails assets:precompile
```

Ownerアカウントを作る
```
RAILS_ENV=production bin/tootctl accounts create a --email a@localhost --confirmed --role Owner
```

Systemd登録するのめんどいのでフォアグラウンドで上げる.
```
# 以下のファイルを持ってくる
cp -i ../mastodon-dev-for-misskey/Procfile.prod .

gem install foreman --no-document

foreman start -f Procfile.prod 
```
これで、Web: Port 52873, Streaming: Port 52874 で上がるはず。

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
