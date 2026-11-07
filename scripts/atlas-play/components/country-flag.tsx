import flags from 'atlas-flags';
export function CountryFlag({code}:{code:string}){
 const src=flags[code];
 return src?<img className="country-flag" src={src} alt="" aria-hidden="true" width="24" height="18"/>:null;
}
