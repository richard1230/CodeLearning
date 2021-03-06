

Element.prototype.elemChildren = function (index) {
  var childNodes = this.childNodes,
    len = childNodes.length,
    item;
  var temp = {
    'length': 0,
    'push': Array.prototype.push,
    'splice': Array.prototype.splice
  };
  for (let i = 0; i < len; i++) {
    item = childNodes[i];

    if (item.nodeType === 1) {
      temp.push(item)
    }
  }

  if (index !== undefined && typeof (index) !== 'number') {//存在且不为number类型,就是string类型
    return undefined;
  }
  return index === undefined ? temp : temp[index];
}


function getFullchildren(node) {
  var children = node.children,
    len = children.length,
    item;
  if (node && node.nodeType === 1) {
    console.log(node);
  }

  for (var i = 0; i < len; i++) {
    item = children[i];

    if (item.nodeType === 1) {
      getFullchildren(item)
    }
  }
}

Element.prototype.elemParent = function (n) {
  var type = typeof n,
    elem = this;
  if (type === 'undefined' || type !== "number") {
    return elem.parentNode;
  } else if (n < 0) {
    return undefined;
  }

  while (n) {
    if (elem.nodeName === 'HTML') {
      elem = null
      return elem
    }
    elem = elem.parentNode;
    n--;
  }
  return elem;
}

//封装的是滚动条的位移
//封装滚动条,考虑到兼容性了,很重要!下面是企业的写法
function getScrollOffset() {
  if (window.pageXOffset) {
    return {
      left: window.pageXOffset,
      top: window.pageYOffset
    }
  } else {
    return {
      left: document.body.scrollLeft + document.documentElement.scrollLeft,
      //两者一般只有一个有效,故写为加法
      top: document.body.scrollTop + document.documentElement.scrollTop
    }
  }
}

//下面是考虑过兼容性之后的封装可视窗口
function getViewportSize() {
  if (window.innerWidth) {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  } else {
    if (document.compatMode === "BackCompat") {
      return {
        width: document.body.clientWidth,
        height: document.body.clientHeight
      }
    } else {
      return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      }
    }
  }
}

//封装html文档的高度和宽度
function getScrollSize() {
  if (document.body.scrollWidth) {
    return {
      width: document.body.scrollWidth,
      height: document.body.scrollHeight
    }
  } else {
    return {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight
    }
  }
}

// 获取元素距离窗口左上角的位置坐标
function getElemToDocPosition(el) {
  var parent = el.offsetParent,
    offsetLeft = el.offsetLeft,
    offsetTop = el.offsetTop;

  while (parent) {
    offsetLeft += parent.offsetLeft;
    offsetTop += parent.offsetTop;
    parent = parent.offsetParent;
  }

  return {
    left: offsetLeft,
    top: offsetTop
  }

}

//获取当前鼠标位置在文档(将滚动条包含在内)中的坐标
function pagePos(e) {
  // 获取滚动距离
  var sLeft = getScrollOffset().left,
    sTop = getScrollOffset().top,
    // 获取文档偏移
    cLeft = document.documentElement.clientLeft || 0,
    cTop = document.documentElement.clientTop || 0;

  return {
    X: e.clientX + sLeft - cLeft,
    Y: e.clientY + sTop - cTop
  }
}

//获取元素的样式属性====>兼容了不同的浏览器
function getStyles(el, prop) {
  if (window.getComputedStyle) {
    if (prop) {
      return parseInt(window.getComputedStyle(el, null)[prop]);
    } else {
      return window.getComputedStyle(el, null);
    }
  } else {
    if (prop) {
      return parseInt(el.currentStyle[prop]);
    } else {
      return el.currentStyle;
    }
  }
}

// 事件监听封装(考虑到兼容性)
function addEvent(el, type, fn) {
  if (el.addEventListener) {
    // W3C
    el.addEventListener(type, fn, false);
  } else if (el.attachEvent) {
    // IE8及以下
    el.attachEvent('on' + type, function () {
      fn.call(el);//这里为什么要这么写?
      //函数里面的this是指向window的,这里这么写是为了改变this的指向,使this指向el
    });
  } else {
    // 最低版本
    el['on' + type] = fn;
  }
}


// 解除事件监听
function removeEvent(el, type, fn) {
  if (el.addEventListener) {
    el.removeEventListener(type, fn, false);
  } else if (el.attachEvent) {
    el.detachEvent('on' + type, fn);
  } else {
    el['on' + type] = null;
  }
}

//取消冒泡
function cancelBubble(e) {
  // 兼容IE8，IE8事件存放在 window.event
  var e = e || window.event;
  if (e.stopPropagation) {
    e.stopPropagation();
  } else {
    e.cancelBubble = true;
  }
}


// 封装取消默认事件
function stopEvent(e) {
  var e = e || window.event;
  if (e.preventDefault) {
    // W3C
    e.preventDefault();
  } else {
    // IE9以下
    e.returnValue = false;
  }
}

// 封装拖拽函数
function elemDrag(el) {
  var x,
    y;

  addEvent(el, 'mousedown', function(e){
    var e = e || window.event;
    x = pagePos(e).X - getStyles(el, 'left');
    y = pagePos(e).Y - getStyles(el, 'top');

    addEvent(document, 'mousemove', mouseMove);
    addEvent(document, 'mouseup', mouseUp);

    // 去掉冒泡
    cancelBubble(e);
    // 取消默认事件
    stopEvent(e);
  });

  function mouseMove(e) {
    var e = e || window.event;
    el.style.left = pagePos(e).X - x + 'px';
    el.style.top = pagePos(e).Y - y + 'px';
  }

  function mouseUp(e) {
    var e = e || window.event;
    removeEvent(document, 'mousemove', mouseMove);
    removeEvent(document, 'mouseup', mouseUp);
  }
}