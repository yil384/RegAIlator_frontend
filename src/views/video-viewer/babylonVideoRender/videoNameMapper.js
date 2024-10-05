export const videoNameMapper = (vSrc) => {
  let videoName = 'N/A';
  if (vSrc) {
    const splitVSrc = vSrc.split('/');
    if (splitVSrc.length) {
      videoName = (splitVSrc[splitVSrc.length - 1] || 'N/A').toUpperCase()
    }
  }
  return videoName
};
