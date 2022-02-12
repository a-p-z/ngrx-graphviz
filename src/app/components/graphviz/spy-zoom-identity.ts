import createSpyObj = jasmine.createSpyObj;

export const zoomIdentity = createSpyObj('zoomTransform', ['scale', 'translate']);
zoomIdentity.translate.and.returnValue(zoomIdentity);
zoomIdentity.scale.and.returnValue(zoomIdentity);
