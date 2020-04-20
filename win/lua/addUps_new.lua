#!/usr/bin/env lua

local cjson = require "cjson"
local ps = require("password")
if not ps.checkLogin2() then
	return
end

ngx.req.read_body()
local hostName = ngx.req.get_post_args()["hostName"]
local loadName = ngx.req.get_post_args()["loadName"]
local ip = ngx.req.get_post_args()["ip"]
local weight = ngx.req.get_post_args()["weight"]
local op = ngx.req.get_post_args()["op"]
local resultMap = {}


if hostName==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数hostName"
	ngx.say(cjson.encode(resultMap))
	return
end

if loadName==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数loadName"
	ngx.say(cjson.encode(resultMap))
	return
end

if ip==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数host"
	ngx.say(cjson.encode(resultMap))
	return
end

if weight==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数weight"
	ngx.say(cjson.encode(resultMap))
	return
end

if op==nil then
	resultMap["state"]="fail"
	resultMap["message"]="缺少参数op"
	ngx.say(cjson.encode(resultMap))
	return
end

local dynupszone = ngx.shared.dyn_ups_zone;
local jsonStr = dynupszone:get("myServers");
local serverTable1 = cjson.decode(jsonStr)

-- if serverTable1~=nil then
--   if serverTable1[loadName]~=nil then
--     local server1=serverTable1[loadName]
--   if server1[hostName]~=nil then
--     local server2=server1[hostName]
-- 		if op=="add" then
--       if ip == server2.ip then
--         resultMap["state"]="fail"
--         resultMap["message"]="这个负载下，已存在该 ip:port"
--         ngx.say(cjson.encode(resultMap))
--         return
--       end
-- 		end
-- 	end
--   end
-- end


if serverTable1~=nil then
  local existence=false
  if serverTable1[loadName]~=nil then
    local server1=serverTable1[loadName]
    for key,value in pairs(server1) do
      if op=="add" then
        if ip == value.ip then
            existence=true
        end
      end
	end
  end
  if (existence) then
    resultMap["state"]="fail"
    resultMap["message"]="ip 已存在"
    ngx.say(cjson.encode(resultMap))
    return
  end
end



--存入dict
local upss = dynupszone:get("myServers");
local upsteamTable={}

if op=="add" then
	upsteamTable = cjson.decode(upss)
	local map = {}
	-- 判断 loadName 在共享区域是否存在
	if upsteamTable[loadName]~=nil then
		local server=upsteamTable[loadName]

		-- 判断 主机是否存在
    if server[hostName] ~= nil then
      map.health="Y"
      map.state="on"
      map.ip=ip
      map.weight = weight
      map.cweight=0
      server[hostName]=map
      upsteamTable[loadName]=server
    else
      map.health="Y"
      map.state="on"
      map.ip=ip
      map.weight = weight
      map.cweight=0
      server[hostName]=map
      upsteamTable[loadName]=server
    end
	else
		local server={}
		map.state="on"
		map.health="Y"
    map.ip=ip
    map.weight = weight
    map.cweight=0
		server[hostName]=map
    upsteamTable[loadName]=server
	end
else
  upsteamTable = cjson.decode(upss)
  for k,v in pairs(upsteamTable) do
    v.cweight=0
    if v.ip == ip then
      v.weight = weight
    end
  end
end



dynupszone:set("myServers",cjson.encode(upsteamTable))
ngx.log(ngx.INFO,"===upss==",cjson.encode(upsteamTable))
--生成文件保存
local file = io.open("conf/proxy_new.json","w+")
local str = cjson.encode(upsteamTable)
file:write( str )
file:close()

--返回
resultMap["state"]="success"
resultMap["message"]=""
ngx.say(cjson.encode(resultMap))



