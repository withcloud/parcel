// 計算 object fit
// https://stackoverflow.com/questions/37256745/object-fit-get-resulting-dimensions
export function getObjectFitSize(
  contains /* true = contain, false = cover */,
  containerWidth,
  containerHeight,
  width,
  height
) {
  var doRatio = width / height;
  var cRatio = containerWidth / containerHeight;

  var targetWidth = 0;
  var targetHeight = 0;
  var test = contains ? doRatio > cRatio : doRatio < cRatio;

  var w = 0;
  var h = 0;
  var x = 0;
  var y = 0;

  if (test) {
    targetWidth = containerWidth;
    targetHeight = targetWidth / doRatio;
    w = width;
    h = w / cRatio;
    x = 0;
    y = (height - h) / 2;
  } else {
    targetHeight = containerHeight;
    targetWidth = targetHeight * doRatio;
    h = height;
    w = h * cRatio;
    x = (width - w) / 2;
    y = 0;
  }

  return {
    width: targetWidth,
    height: targetHeight,
    x,
    y,
    w,
    h
  };
}
