const fs=require('fs');
const p='ZarfTokenWebApp/src/components/EventCard.jsx';
let s=fs.readFileSync(p,'utf8');
const startTag='const EventCard = ({';
const endTag='}) => {';
const si=s.indexOf(startTag);
const ei=s.indexOf(endTag, si);
if(si>=0 && ei>si){
  const before=s.slice(0,si);
  const after=s.slice(ei+endTag.length);
  const header=`const EventCard = ({
  event: rawEvent,
  user,
  userIsPrivileged,
  userIsEligible,
  onDelete,
  onRegister,
  onViewBooths,
  onViewDetails,
  isFavourite,
  onToggleFavourite,
}) => {`;
  s=before+header+after;
}
// sanitize odd characters introduced accidentally
s=s.replace(/Visit Website [^<]*</g,'Visit Website<');
s=s.replace(/Registered [^<]*</g,'Registered<');
// ensure imports for eventUtils and useNavigate exist
if(!/from "\.\.\/pages\/eventUtils";/.test(s)){
  s=s.replace(/import React[^\n]*\n/, (m)=> m+ 'import { getEventDetails, formatSimpleDate } from "../pages/eventUtils";\nimport { useNavigate } from "react-router-dom";\n');
}
// ensure lucide-react import includes Heart in one line
s=s.replace(/import \{[\s\S]*?\} from "lucide-react";/,'import { Clock, MapPin, User, Building, DollarSign, ClockAlert, Store, ChevronDown, ChevronUp, Calendar, Heart } from "lucide-react";');
fs.writeFileSync(p,s);
console.log('EventCard header sanitized');
