/***
 * 所有应用js
 * 
 */


/**
 * Get取数据
 * @param url
 * @param data 数据
 * @param success 成功回调函数
 * @param me Vue对象
 * @returns
 */
function getData(url,data,me,success){
	var errorFunc=function(XMLHttpRequest, textStatus, errorThrown){
		if(XMLHttpRequest.status>=400 && XMLHttpRequest.status<500 ){
			me.$message.error("会话超时，请刷新页面");
		}else{
			me.$message.error("获取数据失败！");
		}
		
	};
	
	//调用前
	var loading=function(){
		me.loading=true;
	};
	//调用完成
	var completed=function(xhr, textStatus){
		me.loading=false;
	};
	
	//success函数
	var gsuccess=function(data){
		var tmp=data+"";
		me.loading=false;
		success(data);
	};

	$.ajax({
	   type: "GET",
	   cache:false,
	   url:  url,	  
	   data: data,
	   complete:completed,
	   beforeSend:loading,
	   success: gsuccess,
	   error:errorFunc
	});
}

/**
 * Post数据
 * @param url
 * @param data 数据
 * @param success 成功回调函数
 * @param me Vue对象
 * @returns
 */
function postData(url,data,me,success){
	var errorFunc=function(XMLHttpRequest, textStatus, errorThrown){
		if(XMLHttpRequest.status>=400 && XMLHttpRequest.status<500 ){
			me.$message.error("会话超时，请刷新页面");
		}else{
			me.$message.error("获取数据失败！");
		}
	};
	
	//调用前
	var loading=function(){
		$('#loading').show();
	};
	//调用完成
	var completed=function(xhr, textStatus){
		$('#loading').hide();

	};
	
	//success函数
	var gsuccess=function(data){
		var tmp=data+"";
		success(data);		
	};

	$.ajax({
	   type: "POST",
	   cache:false,
	   url:  url,	  
	   data: data,
	   complete:completed,
	   beforeSend:loading,
	   success: gsuccess,
	   error:errorFunc
	});
}


function postJsonData(url,data,me,success){
	var errorFunc=function(){
		me.$message.error("获取数据失败！");
	};
	
	//调用前
	var loading=function(){
		$('#loading').show();
	};
	//调用完成
	var completed=function(xhr, textStatus){
		$('#loading').hide();
	};
	
	//success函数
	var gsuccess=function(data){
		var tmp=data+"";
		success(data);
	};

	$.ajax({
	   type: "POST",
	   cache:false,
	   url:  url,	  
	   contentType: "application/json",
	   dataType: "json",
	   data: JSON.stringify(data),
	   complete:completed,
	   beforeSend:loading,
	   success: gsuccess,
	   error:errorFunc
	});
}

//字节转大小
function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024, // or 1024
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
   return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

//内页高度
$(document).ready(function(){	
	if(window.parent==window.self){
		//没有外层frame时，跳转到首页
		//document.location="/pm/index.jsp";
	}else{
		$("#app").css("min-height",$(window).height()-40);
	}	
});

//后缀转成图片图标
function suffix2img(suffix){
	if(suffix==null){
		return "icon-file";
	}
	
	var tmp = suffix.toLowerCase();
	switch(tmp){
	    case "pdf":
	    	return "icon-pdf";
	    	break;
	    case "doc":
	    	return "icon-word";
	    	break;
	    case "docx":
	    	return "icon-word";
	    	break;
	    case "xls":
	    	return "icon-excel";
	    	break;
	    case "xlsx":
	    	return "icon-excel";
	    	break;
	    case "txt":
	    	return "icon-text";
	    	break;
	    case "html":
	    	return "icon-html";
	    	break;
	    case "htm":
	    	return "icon-html";
	    	break;
	    case "jpg":
	    	return "icon-picture";
	    	break;
	    case "jpeg":
	    	return "icon-picture";
	    	break;
	    case "png":
	    	return "icon-picture";
	    	break;
	    case "gif":
	    	return "icon-picture";
	    	break;	    
	}
	
	var audios = ".wav; .m3u; .cda; .ogg; .ape; .flac; .aac; .acp; .aif; .aifc; .aiff; .au; .la1; .lavs; .lmsff; .mid; .midi; .mnd; .mns; .mp1; .mp2; .mp3; .mpga; .pls; .ra; .ram; .rmi; .rmm; .rpm; .snd; .wax; .wma; .xpl";
	var videos = ".mxf;.avi; .mp4; .wmv; .mxf; .ts; .rmvb; .mov; .dat; .mpe; .asf; .asx; .ivf; .m1v; .m2v; .m4e; .movie; .mp2v; .mp2v; .mpa; .mpeg; .mpg; .mps; .mpv; .mpv2; .rv; .wm; .wmx; .wvx"
	
	if( videos.indexOf(tmp)>0 ){
		return "icon-video";
	}
	
	if(audios.indexOf(tmp)>0){
		return "icon-icaudio";
	}
	
	return "icon-file";
}