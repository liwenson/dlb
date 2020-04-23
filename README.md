在原作者基础上修改

```
https://github.com/p664940448/DLB
```



### win

复制 win 目录下所有文件到 openresty 根目录

### linux

复制 linux 目录下所有文件到 openresty/nginx 目录

```bash
cp linux/* /usr/local/openresty/nginx
```



使用方式

```nginx
    server {
        listen       8088;
        server_name  localhost;

        location / {
            default_type text/html;
            set $loadName  "test";     #负载名称
            set $method  "polling";    #负载方式   polling /  weight
            set_by_lua_file $cur_ups lua/proxy_new.lua;
            # echo $cur_ups;
            proxy_next_upstream off;  
            proxy_set_header Host $host:$server_port;
            proxy_set_header Remote_Addr $remote_addr;
            proxy_set_header remote-user-ip $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_pass http://$cur_ups;
        }
    }

```



### api

添加

```bash
curl -H "Content-Type: application/x-www-form-urlencoded" -d "loadName=test&hostName=test01&weight=10&ip=172.16.100.11:30019&op=add" http://127.0.0.1/api_addUps
```



删除

```bash
curl -H "Content-Type: application/x-www-form-urlencoded" http://127.0.0.1/api_delete?loadName=test&hostsName=test01
```

上下线

```bash
上线
curl -H "Content-Type: application/x-www-form-urlencoded" -d "loadName=test&hostName=test01&state=on" http://127.0.0.1/api_stop

下线
curl -H "Content-Type: application/x-www-form-urlencoded" -d "loadName=test&hostName=test01&state=off" http://127.0.0.1/api_stop
```



