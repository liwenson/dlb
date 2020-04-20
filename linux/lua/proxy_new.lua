#!/usr/bin/env lua
local cjson = require "cjson"
local upss = ngx.shared.dyn_ups_zone:get("myServers")
local UploadTable = cjson.decode(upss)



local loadName=ngx.var.loadName;
local method=ngx.var.method;

function getTblLen(tbl)
  -- 获取 table 长度
  if type(tbl) ~= "table" then
      print("类型错误")
      return
  end
  local len = 0
  for k, v in pairs(tbl) do
      len = len + 1
  end
  return len
end

function simrand(len)
  -- 生成随机数
	math.randomseed(os.time())
	local num = math.random(len)
	return num
end


function simple_polling(data)
    -- 实现简易轮询
  local uplist={}
  for k,v in pairs(data) do
    if v.state=="on" and v.health=="Y" then
			table.insert(uplist,v)
		end
  end
  local len=getTblLen(uplist)
  math.randomseed(tostring(ngx.now()):reverse():sub(1, 6))
  local n = math.random(len)
  local x= uplist[n]
  return x.ip
end


function weight(serverTable)
	-- 权重
  local total = 0
  local uplist={}
	for k,v in pairs(serverTable) do
		local xx= JSON:encode(v)
		print(xx)
		if v.state=="on" and v.health=="Y" then
			table.insert(uplist,v)
		end
	end
	for k,v in ipairs(uplist) do
		-- 计算 weight
		v.cweight = v.cweight + v.weight
		total = total + v.cweight
	end

	--取最大weight，选server，置cweight
	local selectServer=""
	local maxWeight = -100000
	local index = 0
	for k,v in pairs(uplist) do
		local map = v
		if map.cweight > maxWeight then
			maxWeight = map.cweight
			selectServer = map.ip
			index = k
		end
	end
    uplist[index].cweight = uplist[index].cweight - total
    local upss_string = cjson.encode(uplist)
    ngx.shared.dyn_ups_zone:set("myServers",upss_string)
    return selectServer

end

local ip=nil
if UploadTable ~=nil then
  local serverTable = UploadTable[loadName]
  if serverTable == nil then
    ngx.log(ngx.INFO,"===serverTable为空==",cjson.encode(serverTable))
  end
  if method == nil or method == "weight" then
    ip= weight(serverTable)
  elseif method == "polling" then
    ip= simple_polling(serverTable)
  end
end
return ip
