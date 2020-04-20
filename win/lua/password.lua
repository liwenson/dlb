local cjson = require("cjson")
local _M = {
	_VERSION = '1.0'
}

--默认密码
local defaultPassword = "admin"

local resultMap = {}
function _M.checkPassword(_password)
	if defaultPassword == _password then
		ngx.shared.dyn_ups_zone:set("loginState","YES",60*60*4)
		return true
	else
		ngx.shared.dyn_ups_zone:delete("loginState")
		return false
	end
end

function _M.init()
	ngx.shared.dyn_ups_zone:delete("loginState")
end

function _M.checkLogin()
	local loginState = ngx.shared.dyn_ups_zone:get("loginState")
	if loginState==nil or "NO"==loginState then
		return false
	else
		return true
	end
end

function _M.checkLogin2()
	local loginState = ngx.shared.dyn_ups_zone:get("loginState")
	if loginState==nil or "NO"==loginState then
		ngx.status = 401
		ngx.say("会话超时")
		return false
	else
		return true
	end
end

function _M.exit()
	ngx.shared.dyn_ups_zone:delete("loginState")
end


return _M