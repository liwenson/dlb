#!/usr/bin/env lua

local file = io.open("conf/proxy_new.json","r")

local jsonStr = ""
for line in file:lines() do
	jsonStr = jsonStr .. line
end

file:close()

local cjson = require "cjson"
local dynupszone = ngx.shared.dyn_ups_zone
local succ, err, forcible = dynupszone:set("myServers",jsonStr);


local hc = dofile("lua/health.lua")
local ok,err = hc.init()
if not ok then
    ngx.log(ngx.ERR, "failed to spawn health checker: ", err)
    return
else
	ngx.log(ngx.INFO,"health check start")
end

local ps = dofile("lua/password.lua")
ps.init()

