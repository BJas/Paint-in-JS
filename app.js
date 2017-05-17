var uploadItem = function(canvas, item){
  var cnt = canvas.getContext('2d');
  var fileReader = new FileReader();

  fileReader.onload = function(e){
    var img = new Image();
    img.src = e.target.result;
    img.onload = function(){
      canvas.width  = img.width;
      canvas.height = img.height;
      cnt.drawImage(img, 0, 0, img.width, img.height);
    };
  };

  fileReader.readAsDataURL(item);
};

function getFilter(sp, arr){
  var w = canvas.width;
  var h = canvas.height;
  for (var i = 0; i < w; i++) {
      for (var j = 0; j < h; j++) {
        var r=0, g=0, b=0, ind1=0;
        for (var a = i-1; a <= i+1; a++) {
          var ind2 = 0;
        for (var b = j-1; b <= j+1; b++) {
            var mean = arr[ind1][ind2];
            if (a>=0 && a<w && b>=0 && b<h) {
              var ind = (b*w+a)*4;
              r += sp[ind] * mean;
              g += sp[ind + 1] * mean;
              b += sp[ind + 2] * mean; 
          }
          ind2++;
        }
        ind1++;
      }
      var pos = (j*w+i)*4;
      sp[pos] = r;
      sp[pos + 1] = g;
      sp[pos + 2] = b;
      }
    }
    return sp;
}




var filters = {
  inverse: function(imgData){
    var sp = imgData;
    var ll = function(vl){
      return 255 - vl;
    };
    for(var i = 0; i < imgData.length; i+=4){
      sp[i] = ll(sp[i]);
      sp[i+1] = ll(sp[i+1]);
      sp[i+2] = ll(sp[i+2]);
    }
    return sp;
  },

  noise: function(imgData){
    var sp = imgData;
    var coefficient = 0.02;
    var ll = function(vl){
      var g_VALUE = Math.random()*100;
      if(g_VALUE <= coefficient*100){
        if(Math.floor(Math.random()*25) == 2)
          return 255;
        else
          return vl;
      }
      return vl;
    };

    for(var i = 0; i < imgData.length; i+=4){
      sp[i] = ll(sp[i]);
      sp[i+1] = ll(sp[i+1]);
      sp[i+2] = ll(sp[i+2]);
    }
    return sp;
  },

  treshold: function(imgData){
    var sp = imgData;
    var ll = function(vl){
      return vl>128?0:255;
    };
    for(var i = 0; i < imgData.length; i+=4){
      var mean = (sp[i] + sp[i+1] + sp[i+2])/3;
      sp[i] = ll(mean);
      sp[i+1] = ll(mean);
      sp[i+2] = ll(mean);
    }
    return sp;
  },

  brightness: function(imgData){
  var sp = imgData;
  var adj=30;
  for(var i = 0; i < imgData.length; i+=4){
    sp[i] += adj;
    sp[i+1] += adj;
    sp[i+2] += adj;
    }
    return sp;
  },

  grayscale: function(imgData){
  var sp = imgData;
  for(var i = 0; i < imgData.length; i+=4){
    var avg = (sp[i]+sp[i+1]+sp[i+2])/3;
    sp[i] += avg;
    sp[i+1] += avg;
    sp[i+2] += avg;
    }
    return sp;
  },

  duotone: function(imgData){
  var sp = imgData;
  for(var i = 0; i < imgData.length; i+=4){
    sp[i] += (sp[i]+sp[i+1]+sp[i+2])/3;
    }
    return sp;
  },

  contrast: function(imgData){
  var sp = imgData;
  for(var i = 0; i < imgData.length; i+=4){
    var ll = function(vl) {
      return ((((vl/255)-0.5)*9)+0.5)*255;
    }
    sp[i] += ll(sp[i]);
    sp[i+1] += ll(sp[i+1]);
    sp[i+2] += ll(sp[i+2]);
    }
    return sp;
  },

  sharpen: function(imgData){
    var sp = imgData;
    var list = [[-1, -1, -1], [-1,  9, -1], [-1, -1, -1]];
    return getFilter(sp,list);
  },

  blur: function(imgData){
    var sp = imgData;
    var list = [[1/9, 1/9, 1/9], [1/9,  1/9, 1/9], [1/9, 1/9, 1/9]];
    return getFilter(sp,list);
  },

  sobel: function(imgData){
    var sp = imgData;
    var list = [[-1,0,1], [-2,0,2], [-1,0,1]];
    return getFilter(sp,list);
  },

  laplace: function(imgData){
    var sp = imgData;
    var list = [[0,-1,0], [-1,4,-1], [0,-1,0]];
    return getFilter(sp,list);
  }
  
};

var draw = function(canvas, imgData){
  var cont = canvas.getContext('2d');
  var currImgData = cont.getImageData(0, 0, canvas.width, canvas.height);
  for(var i = 0; i < currImgData.data.length; i += 4){
    currImgData.data[i]   = imgData[i];
    currImgData.data[i+1] = imgData[i+1];
    currImgData.data[i+2] = imgData[i+2];
  }
  cont.putImageData(currImgData, 0, 0);
};

var process = function(filterCallback, canvas){
  var imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  var tmp = filterCallback(imgData.data);
  draw(canvas, tmp);
};

var run = function(canvas){
  $('.canvas-container').on('dragleave', function(e){
    $(this).removeClass('dragging');
    return false;
  })
  .on('drop', function(e){
    $(this).addClass('dropped');

    var originalEvent = e.originalEvent;
    var dataTransfer  = originalEvent.dataTransfer;
    var files = dataTransfer.files || [];

    uploadItem(canvas, files[0]);

    return false;
  })
  .on('dragover', function(e){
    $(this).addClass('dragging');
    return false;
  });
};


 var isDrawing = false;
  var oldX = null,
    oldY = null;

  var drawPoint = function(x, y, mode){
   
    var context = $('canvas')[0].getContext('2d');
    context.lineJoin = "round";
    context.lineWidth = 1;

    context.beginPath();
    if(mode=="pen"){
      context.globalCompositeOperation="source-over";
      context.moveTo(oldX || x, oldY || y);
      context.lineTo(x, y);
      context.stroke();     
    }else{
      context.globalCompositeOperation="destination-out";
      context.strokeStyle = 'white';
      context.arc(oldX || x, oldY || y,6,0,Math.PI*2,false);
      context.fill();
    }
   
    oldX = x;
    oldY = y;
  };

  var newList = [['green','cyan'], ['blue','green']];
  function changeColor(color) {
    var context = $('canvas')[0].getContext('2d');
    for (var i = 0; i <newList.length; i++) {
         if(color == newList[i][0]) 
            context.strokeStyle = newList[i][1];
    }
  };


$(document).ready(function(){
  var canvas = $('#canvas');
  run(canvas[0]);

  // Когда пользователь нажимает на кнопку
  $('.js-button-action').click(function(){
    var filter = $(this).data('filter');
    process(filters[filter], $('#canvas')[0]);
  });

  canvas.height = 500;
  canvas.width = 700;


  $('#pencil').click(function(){
    mode="pen";
    $(canvas).on('mousedown', function(e){
      isDrawing = true;
      drawPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, mode);
    }).on('mouseup', function(e){
      isDrawing = false;
      drawPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, mode);
      oldX = null;
      oldY = null;
    }).on('mousemove', function(e){
      if(isDrawing){
      drawPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, mode);
    }
    });
  });
 
$('#eraser').click(function(){
    mode="eraser";
    $(canvas).on('mousedown', function(e){
      isDrawing = true;
      drawPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, mode);
    }).on('mouseup', function(e){
      isDrawing = false;
      drawPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, mode);
      oldX = null;
      oldY = null;
    }).on('mousemove', function(e){
      if(isDrawing){
      drawPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, mode);
    }
    });
  });
 
});



