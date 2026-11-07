import visualContextData from './public/data/visual-context.json';
import data from './public/data/countries.json';
import worldUrl from './public/world.svg';
import borderLicense from './public/data/border-license.txt';
export {worldUrl};
export const dataUrl=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));
export const borderLicenseUrl=URL.createObjectURL(new Blob([borderLicense],{type:'text/plain'}));

export const visualDataUrl=URL.createObjectURL(new Blob([JSON.stringify(visualContextData)],{type:'application/json'}));
