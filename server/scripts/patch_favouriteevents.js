const fs = require('fs');
const p = 'ZarfTokenWebApp/src/pages/userPages/FavouriteEvents.jsx';
let s = fs.readFileSync(p, 'utf8');
// add simple toast state and render
if (!s.includes('toastMsg')) {
  s = s.replace('useState(false);', 'useState(false);\n  const [toastMsg, setToastMsg] = useState(null);\n  const [toastType, setToastType] = useState("info");');
  s = s.replace('setFavs(list);', 'setFavs(list);\n      setToastMsg("Favorites loaded"); setToastType("success"); setTimeout(()=>setToastMsg(null),1500);');
  s = s.replace('alert(e?.response?.data?.message || "Failed to remove from favorites");', 'setToastMsg(e?.response?.data?.message || "Failed to remove from favorites"); setToastType("error"); setTimeout(()=>setToastMsg(null),2500);');
  s = s.replace('setFavs((cur) => cur.filter((x) => !(x.itemType === fav.itemType && x.itemId === fav.itemId)));', 'setFavs((cur) => cur.filter((x) => !(x.itemType === fav.itemType && x.itemId === fav.itemId))); setToastMsg("Removed from favorites"); setToastType("success"); setTimeout(()=>setToastMsg(null),2000);');
  s = s.replace('</div>\n  );\n}', '{toastMsg && (<div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toastType==="error"?"bg-red-600":"bg-emerald-600"}`}>{toastMsg}</div>)}\n    </div>\n  );\n}');
}
// add confirmation before removal
s = s.replace('onClick={() => handleRemove(fav)}', 'onClick={() => { if (confirm("Remove from favorites?")) handleRemove(fav); }}');
fs.writeFileSync(p, s);
console.log('enhanced FavouriteEvents with toast and confirm');
