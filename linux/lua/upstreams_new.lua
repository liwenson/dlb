#!/usr/bin/env lua
local ps = require("password")
ps.checkLogin2()

local upss = ngx.shared.dyn_ups_zone:get("myServers");
ngx.say(upss)