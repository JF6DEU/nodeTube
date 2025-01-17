# nodeTube

日本語の(node.jsで作られた)YouTubeビューワー\
所詮Yukiのめちゃくちゃ改造版です。\
動作が重い代わりに安定しています。\
`/@keiji`というコマンドで掲示板へアクセスできるようになりました。

掲示板のID/PWは[こちら](https://forms.gle/pdjX5HhZNx2ZQqpU6)から作成できます。

nodeTubeに入るためのパスワードは[passsend.jf6deu.net](https://passsend.jf6deu.net/)から入手できます。

使い方は[こちらのScratch](https://scratch.mit.edu/projects/1081970754)に詳しく載っています。

# デプロイ方法

~~いまのところrenderしか対応してないけど~~Koyebにも対応しました。さらにVercelにも対応しました。\
[ここ](http://render.com/deploy?repo=https://github.com/JF6DEU/nodeTube/)からデプロイできるよ。(事前にrenderアカウント作成必須)

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?name=nodetube&repository=JF6DEU%2FnodeTube&branch=main&builder=dockerfile&instance_type=free&regions=was&ports=4338%3Bhttp%3B%2F&hc_protocol%5B4338%5D=tcp&hc_grace_period%5B4338%5D=5&hc_interval%5B4338%5D=30&hc_restart_limit%5B4338%5D=3&hc_timeout%5B4338%5D=5&hc_path%5B4338%5D=%2F&hc_method%5B4338%5D=get)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjf6deu%2FnodeTube.git)

# その他

先生モードとしてバックグラウンド再生はできないよ。\
タブ切り替えると一瞬で再生が止まるよ。(ホントは`setTimeout`をブラウザが止めてしまって...おっとこれ以上は言えないなぁ)

# 注意事項

定期的にインスタンスを再起動してね。(プロキシを読むため)\
renderだとManual DeployからRestart serviceをクリックしたらできるよ。\
~~いい加減cookie_parser使え~~
