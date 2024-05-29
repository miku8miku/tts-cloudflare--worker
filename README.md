# tts-cloudflare--worker
食用指北
https://linux.do/t/topic/98216
![image](https://github.com/miku8miku/tts-cloudflare--worker/assets/52441374/8be35c37-e77e-4fa9-a8ee-4cc8255304a9)


## 提供编译docker镜像，修改idex.js中url后再编译！！！
```shell
cd docker
docker build -t tts .
docker run -d -p 8080:8080 tts
```
